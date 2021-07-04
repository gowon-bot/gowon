import { Message } from "discord.js";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { Delegate } from "../../../lib/command/BaseCommand";
import { EmojiRaw } from "../../../lib/Emoji";
import { EmptyConnector } from "../../../lib/indexing/BaseConnector";
import { MirrorballBaseCommand } from "../../../lib/indexing/MirrorballCommands";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { displayLink } from "../../../lib/views/displays";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { UserType } from "../../../services/indexing/IndexingTypes";
import SimpleLogin from "./SimpleLogin";

const args = {} as const;

export default class Login extends MirrorballBaseCommand<
  never,
  never,
  typeof args
> {
  idSeed = "loona jinsoul";

  connector = new EmptyConnector();

  description = "Sets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "username";

  arguments: Arguments = args;

  validation: Validation = {};

  delegates: Delegate<typeof args>[] = [
    {
      delegateTo: SimpleLogin,
      when: () => !this.mirrorballGuilds.includes(this.guild.id),
    },
  ];

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

    const sentMessage = await this.author.send(embed);
    await sentMessage.react(EmojiRaw.checkmark);

    const filter: ReactionCollectorFilter = (reaction, user) =>
      reaction.emoji.id === EmojiRaw.checkmark && user.id === this.author.id;

    const reactionCollector = sentMessage.createReactionCollector(filter, {
      time: 5 * 60 * 1000,
    });

    reactionCollector.on("collect", async () => {
      if (await this.handleCreateSession(token, sentMessage)) {
        reactionCollector.stop();
      } else if (!embed.footer?.text?.includes("didn't work")) {
        await sentMessage.edit(
          embed.setFooter(
            "Hmm that didn't work, please ensure you've authenticated with the link and try again"
          )
        );
      }
    });

    reactionCollector.on("error", () => reactionCollector.stop());

    reactionCollector.on("end", async (_: any, reason) => {
      if (reason === "time") {
        await sentMessage.edit(
          embed.setFooter("This login link has expired, please try again")
        );
      }
    });
  }

  private async handleCreateSession(
    token: string,
    sentMessage: Message
  ): Promise<boolean> {
    try {
      const session = await this.lastFMService.getSession({ token });

      const user = await this.usersService.setLastFMSession(
        this.author.id,
        session
      );

      await this.handleIndexerLogin(
        this.author.id,
        session.username,
        session.key
      );

      const successEmbed = this.newEmbed()
        .setDescription(
          `Success! You've been logged in as ${user.lastFMUsername}\n\nWould you like to index your data?`
        )
        .setFooter(this.indexingHelp);

      const confirmationEmbed = new ConfirmationEmbed(
        sentMessage,
        successEmbed,
        this.gowonClient
      );

      this.stopTyping();
      if (await confirmationEmbed.awaitConfirmation()) {
        this.impromptuIndex(
          successEmbed,
          confirmationEmbed,
          session.username,
          this.author.id
        );
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  private async handleIndexerLogin(
    discordID: string,
    username: string,
    session: string | undefined
  ) {
    await this.indexingService.login(
      username,
      discordID,
      UserType.Lastfm,
      session
    );
    try {
      await this.indexingService.quietAddUserToGuild(discordID, this.guild.id);
    } catch (e) {}
  }
}
