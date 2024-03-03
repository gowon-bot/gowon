import { Message } from "discord.js";
import { User } from "../../../database/entity/User";
import { sleep } from "../../../helpers";
import {
  ReactionCollectorFilter,
  sanitizeForDiscord,
} from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Payload } from "../../../lib/context/Payload";
import { Emoji, EmojiRaw } from "../../../lib/emoji/Emoji";
import { displayLink } from "../../../lib/ui/displays";
import { InfoEmbed } from "../../../lib/ui/embeds/InfoEmbed";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { EmbedView } from "../../../lib/ui/views/EmbedView";
import { SyncingProgressView } from "../../../lib/ui/views/SyncingProgressView";
import { LastFMSession } from "../../../services/LastFM/converters/Misc";

export default class Login extends LilacBaseCommand {
  idSeed = "loona jinsoul";

  aliases = ["fmlogin", "set", "fmset"];

  description = "Connect your Last.fm account to Gowon";
  subcategory = "accounts";
  usage = "";

  slashCommand = true;

  async run() {
    const { token } = await this.lastFMService.getToken(this.ctx);

    const url = LastfmLinks.authURL(this.lastFMService.apikey, token);

    await this.reply(
      new InfoEmbed().setDescription("Please check your DMs for a login link")
    );

    const embed = this.minimalEmbed()
      .setTitle("Login with Last.fm")
      .setDescription(
        `To login, ${displayLink(
          "click the link",
          url
        )} and authenticate with Last.fm, then click the react to let Gowon know you're done.\n\nDon't have an account? You can create one at https://last.fm/join`
      );

    const sentMessage = await this.dmAuthor(embed);
    await sentMessage.react(EmojiRaw.checkmark);

    const filter: ReactionCollectorFilter = (reaction, user) =>
      reaction.emoji.id === EmojiRaw.checkmark && user.id === this.author.id;

    const poll = this.pollForLastFMResponse(token);
    const reaction = this.listenForReaction(filter, sentMessage, token, embed);

    const user = await Promise.race([poll, reaction]);

    if (user) {
      const successEmbed = new SuccessEmbed()
        .setDescription(
          `Success! You've been logged in as ${sanitizeForDiscord(
            user.lastFMUsername
          )}\n\nWould you like to sync your Last.fm data?`
        )
        .setFooter(this.syncHelp);

      const confirmationEmbed = new ConfirmationView(
        this.ctx,
        successEmbed,
        new Payload(sentMessage)
      );

      if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
        this.impromptuSync(successEmbed);
      }
    }
  }

  private async impromptuSync(embed: EmbedView) {
    await this.lilacUsersService.sync(this.ctx, { discordID: this.author.id });

    const observable = this.lilacUsersService.syncProgress(this.ctx, {
      discordID: this.author.id,
    });

    const syncingProgressView = new SyncingProgressView(
      this.ctx,
      embed,
      observable
    );

    syncingProgressView.subscribeToObservable();
  }

  private async handleCreateSession(
    token: string
  ): Promise<{ success: boolean; user?: User }> {
    let user: User;

    try {
      const session = await this.lastFMService.getSession(this.ctx, { token });

      user = await this.usersService.setLastFMSession(
        this.ctx,
        this.author.id,
        session
      );

      await this.handleLilacLogin(session.username, session.key);
    } catch (e) {
      return { success: false };
    }

    return { success: true, user };
  }

  private async handleLilacLogin(username: string, session: string) {
    await this.lilacUsersService.login(this.ctx, username, session);
    try {
      await this.lilacGuildsService.addUser(
        this.ctx,
        this.author.id,
        this.requiredGuild.id
      );
    } catch (e) {}
  }

  private async pollForLastFMResponse(
    token: string
  ): Promise<User | undefined> {
    const intervals = [3000, 6000, 10000, 20000];

    let session: LastFMSession | undefined;

    for (const interval of intervals) {
      await sleep(interval);
      try {
        session = await this.lastFMService.getSession(this.ctx, { token });
        break;
      } catch {
        continue;
      }
    }

    if (session) {
      const user = await this.usersService.setLastFMSession(
        this.ctx,
        this.author.id,
        session
      );

      await this.handleLilacLogin(session.username, session.key);

      return user;
    }

    return;
  }

  private async listenForReaction(
    filter: ReactionCollectorFilter,
    sentMessage: Message,
    token: string,
    embed: EmbedView
  ): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      const reactionCollector = sentMessage.createReactionCollector({
        filter,
        time: 5 * 60 * 1000,
      });

      reactionCollector.on("collect", async () => {
        const { success, user } = await this.handleCreateSession(token);

        if (success) {
          reactionCollector.stop();
          resolve(user!);
        } else if (!embed.getFooter()?.includes("didn't work")) {
          embed
            .setFooter(
              "Hmm that didn't work, please ensure you've authenticated with the link and try again"
            )
            .editMessage(this.ctx);
        }
      });

      reactionCollector.on("error", () => {
        reactionCollector.stop();
        reject();
      });

      reactionCollector.on("end", async (_: any, reason) => {
        if (reason === "time") {
          embed
            .setFooter(
              `${Emoji.error} This login link has expired, please try again`
            )
            .editMessage(this.ctx);

          resolve(undefined);
        }
      });
    });
  }
}
