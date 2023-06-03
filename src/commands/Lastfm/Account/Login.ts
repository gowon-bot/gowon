import { Message, MessageEmbed } from "discord.js";
import { User } from "../../../database/entity/User";
import { Stopwatch, sleep } from "../../../helpers";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Payload } from "../../../lib/context/Payload";
import { EmojiRaw } from "../../../lib/emoji/Emoji";
import { displayLink, displayProgressBar } from "../../../lib/views/displays";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
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
        this.impromptuIndex(confirmationEmbed, successEmbed);
      }
    }
  }

  private async impromptuIndex(
    confirmationEmbed: ConfirmationEmbed,
    embed: MessageEmbed
  ) {
    await this.lilacUsersService.index(this.ctx, { discordID: this.author.id });

    confirmationEmbed.sentMessage?.edit({
      embeds: [
        embed.setDescription(
          `Indexing...\n${displayProgressBar(0, 1, {
            width: this.progressBarWidth,
          })}\n*Loading...*`
        ),
      ],
    });

    const observable = this.lilacUsersService.indexingProgress(this.ctx, {
      discordID: this.author.id,
    });

    const sentMessage = confirmationEmbed.sentMessage!;

    const stopwatch = new Stopwatch().start();

    const subscription = observable.subscribe(async (progress) => {
      if (progress.page === progress.totalPages) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription("Done!")
        );
        subscription.unsubscribe();
      } else if (stopwatch.elapsedInMilliseconds >= 3000) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription(
            `Indexing...
${displayProgressBar(progress.page, progress.totalPages, {
  width: this.progressBarWidth,
})}
*Page ${progress.page}/${progress.totalPages}*`
          )
        );

        stopwatch.zero().start();
      }
    });
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
      console.log(e);

      return { success: false };
    }

    return { success: true, user };
  }

  private async handleLilacLogin(username: string, session: string) {
    await this.lilacUsersService.login(this.ctx, username, session);
    try {
      await this.mirrorballUsersService.quietAddUserToGuild(
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
