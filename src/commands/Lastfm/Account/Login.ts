import { Message, MessageEmbed } from "discord.js";
import { User } from "../../../database/entity/User";
import { sleep } from "../../../helpers";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { EmojiRaw } from "../../../lib/Emoji";
import { EmptyConnector } from "../../../lib/indexing/BaseConnector";
import { MirrorballBaseCommand } from "../../../lib/indexing/MirrorballCommands";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { displayLink } from "../../../lib/views/displays";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { UserType } from "../../../services/mirrorball/MirrorballTypes";
import { LastFMSession } from "../../../services/LastFM/converters/Misc";

const args = {} as const;

export default class Login extends MirrorballBaseCommand<
  never,
  never,
  typeof args
> {
  idSeed = "loona jinsoul";

  connector = new EmptyConnector();

  aliases = ["fmlogin", "set", "fmset"];

  description = "Sets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "";

  arguments: Arguments = args;

  validation: Validation = {};

  async run() {
    const { token } = await this.lastFMService.getToken();

    const url = LinkGenerator.authURL(this.lastFMService.apikey, token);

    await this.send(
      this.newEmbed()
        .setAuthor(...this.generateEmbedAuthor("Login"))
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

    const sentMessage = await this.author.send({ embeds: [embed] });
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
        .setFooter(this.indexingHelp);

      const confirmationEmbed = new ConfirmationEmbed(
        sentMessage,
        successEmbed,
        this.gowonClient,
        this.author.id
      );

      if (await confirmationEmbed.awaitConfirmation()) {
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
      const session = await this.lastFMService.getSession({ token });

      user = await this.usersService.setLastFMSession(this.author.id, session);

      await this.handleMirrorballLogin(
        this.author.id,
        session.username,
        session.key
      );
    } catch (e) {
      return { success: false };
    }

    return { success: true, user };
  }

  private async handleMirrorballLogin(
    discordID: string,
    username: string,
    session: string | undefined
  ) {
    await this.mirrorballService.login(
      username,
      discordID,
      UserType.Lastfm,
      session
    );
    try {
      await this.mirrorballService.quietAddUserToGuild(
        discordID,
        this.guild.id
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
        session = await this.lastFMService.getSession({ token });
        break;
      } catch {
        continue;
      }
    }

    if (session) {
      const user = await this.usersService.setLastFMSession(
        this.author.id,
        session
      );

      await this.handleMirrorballLogin(
        this.author.id,
        session.username,
        session.key
      );

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
          await sentMessage.edit({
            embeds: [
              embed.setFooter(
                "Hmm that didn't work, please ensure you've authenticated with the link and try again"
              ),
            ],
          });
        }
      });

      reactionCollector.on("error", () => {
        reactionCollector.stop();
        reject();
      });

      reactionCollector.on("end", async (_: any, reason) => {
        if (reason === "time") {
          await sentMessage.edit({
            embeds: [
              embed.setFooter("This login link has expired, please try again"),
            ],
          });
          resolve(undefined);
        }
      });
    });
  }
}
