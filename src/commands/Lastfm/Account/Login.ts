import { Message, MessageEmbed } from "discord.js";
import { User } from "../../../database/entity/User";
import { sleep } from "../../../helpers";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { EmojiRaw } from "../../../lib/Emoji";
import { EmptyConnector } from "../../../lib/indexing/BaseConnector";
import { MirrorballBaseCommand } from "../../../lib/indexing/MirrorballCommands";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { displayLink } from "../../../lib/views/displays";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { MirrorballUserType } from "../../../services/mirrorball/MirrorballTypes";
import { LastFMSession } from "../../../services/LastFM/converters/Misc";
import { Payload } from "../../../lib/context/Payload";

export default class Login extends MirrorballBaseCommand<never, never> {
  idSeed = "loona jinsoul";

  connector = new EmptyConnector();

  aliases = ["fmlogin", "set", "fmset"];

  description = "Connect your Last.fm account to Gowon";
  subcategory = "accounts";
  usage = "";

  slashCommand = true;

  validation: Validation = {};

  async run() {
    const { token } = await this.lastFMService.getToken(this.ctx);

    const url = LinkGenerator.authURL(this.lastFMService.apikey, token);

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Login"))
        .setDescription("Please check your DMs for a login link")
    );

    const embed = this.newEmbed()
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
      const successEmbed = this.newEmbed()
        .setDescription(
          `Success! You've been logged in as ${user.lastFMUsername}\n\nWould you like to index your data?`
        )
        .setFooter({ text: this.indexingHelp });

      const confirmationEmbed = new ConfirmationEmbed(
        this.ctx,
        successEmbed,
        new Payload(sentMessage)
      );

      if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
        this.impromptuIndex(
          successEmbed,
          confirmationEmbed,
          user.lastFMUsername,
          this.author.id
        );
      }
    }
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

      await this.handleMirrorballLogin(session.username, session.key);
    } catch (e) {
      return { success: false };
    }

    return { success: true, user };
  }

  private async handleMirrorballLogin(
    username: string,
    session: string | undefined
  ) {
    await this.mirrorballService.login(
      this.ctx,
      username,
      MirrorballUserType.Lastfm,
      session
    );
    try {
      await this.mirrorballService.quietAddUserToGuild(
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

      await this.handleMirrorballLogin(session.username, session.key);

      return user;
    }

    return;
  }

  private async listenForReaction(
    filter: ReactionCollectorFilter,
    sentMessage: Message,
    token: string,
    embed: MessageEmbed
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
        } else if (!embed.footer?.text?.includes("didn't work")) {
          this.discordService.edit(
            this.ctx,
            sentMessage,
            embed.setFooter({
              text: "Hmm that didn't work, please ensure you've authenticated with the link and try again",
            })
          );
        }
      });

      reactionCollector.on("error", () => {
        reactionCollector.stop();
        reject();
      });

      reactionCollector.on("end", async (_: any, reason) => {
        if (reason === "time") {
          this.discordService.edit(
            this.ctx,
            sentMessage,
            embed.setFooter({
              text: "This login link has expired, please try again",
            })
          );

          resolve(undefined);
        }
      });
    });
  }
}
