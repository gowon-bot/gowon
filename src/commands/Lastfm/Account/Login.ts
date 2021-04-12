import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { UserInfo } from "../../../services/LastFM/LastFMService.types";
import { differenceInDays, fromUnixTime } from "date-fns";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LogicError } from "../../../errors";
import { IndexingService } from "../../../services/indexing/IndexingService";
import { UserType } from "../../../services/indexing/IndexingTypes";
import { ConfirmationEmbed } from "../../../helpers/Embeds/ConfirmationEmbed";
import {
  ConcurrencyManager,
  ConcurrentActions,
} from "../../../lib/caches/ConcurrencyManager";
import { Delegate } from "../../../lib/command/BaseCommand";
import SimpleLogin from "./SimpleLogin";
import { IndexingBaseCommand } from "../../../lib/indexing/IndexingCommand";
import { EmptyConnector } from "../../../lib/indexing/BaseConnector";
import { Perspective } from "../../../lib/Perspective";

const args = {
  inputs: {
    username: { index: 0 },
  },
  mentions: {
    user: { index: 0 },
    userID: { mention: new DiscordIDMention(true), index: 0 },
  },
} as const;

export default class Login extends IndexingBaseCommand<any, any, typeof args> {
  idSeed = "loona jinsoul";

  connector = new EmptyConnector();

  description = "Sets your Last.fm username in Gowon";
  subcategory = "accounts";
  usage = "username";

  arguments: Arguments = args;

  validation: Validation = {
    username: new validators.Required({
      message: `please enter a last.fm username (\`login <username>\`)`,
    }),
  };

  indexingService = new IndexingService(this.logger);
  concurrencyManager = new ConcurrencyManager();

  private readonly indexerGuilds = ["768596255697272862"];

  delegates: Delegate<typeof args>[] = [
    {
      delegateTo: SimpleLogin,
      when: () => !this.indexerGuilds.includes(this.guild.id),
    },
  ];

  async run(message: Message) {
    let username = this.parsedArguments.username!;

    let { discordUser, senderUsername } = await this.parseMentions({
      fetchDiscordUser: true,
      usernameRequired: false,
    });

    if (username === senderUsername) {
      return this.sendError(`You're already logged in as ${username.code()}`);
    }

    if (
      discordUser &&
      discordUser.id !== this.author.id &&
      !this.message.member?.permissions.has("ADMINISTRATOR")
    ) {
      throw new LogicError(
        "you are not able to set usernames for other users!"
      );
    }

    if (username === "<username>") {
      throw new LogicError(
        "you're supposed to replace <username> with your username!"
      );
    } else if (username.startsWith("<") && username.endsWith(">")) {
      throw new LogicError("please do not include the triangle brackets! (<>)");
    }

    let userInfo: UserInfo | undefined;

    try {
      userInfo = await this.lastFMService.userInfo({ username });
    } catch {
      this.sendError(
        `The user ${username?.code()} couldn't be found!` +
          (username === this.author.username
            ? " You need to login with a **Last.fm** account, if you don't have you can create one at https://www.last.fm/join"
            : "")
      );
      return;
    }

    await this.usersService.setUsername(
      (discordUser || message.author).id,
      userInfo.name
    );
    await this.handleIndexerLogin(
      (discordUser || message.author).id,
      userInfo.name
    );

    let joined = fromUnixTime(userInfo.registered.unixtime.toInt());

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Login"))
      .setDescription(
        `Logged in as ${userInfo.name.code()}${
          differenceInDays(new Date(), joined) < 10
            ? ". Welcome to Last.fm!"
            : ""
        }
        
        Would you like to index your data?`
      )
      .setFooter(this.indexingHelp);

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    this.stopTyping();
    if (await confirmationEmbed.awaitConfirmation()) {
      await confirmationEmbed.sentMessage!.edit(
        embed.setDescription(
          embed.description + "\n\n" + this.indexingInProgressHelp
        )
      );
      await this.concurrencyManager.registerUser(
        ConcurrentActions.Indexing,
        this.author.id
      );
      await this.indexingService.fullIndex(this.author.id, username);
      this.concurrencyManager.registerUser(
        ConcurrentActions.Indexing,
        this.author.id
      );
      this.notifyUser(Perspective.buildPerspective(username, false), "index");
    }
  }

  private async handleIndexerLogin(discordID: string, username: string) {
    await this.indexingService.login(username, discordID, UserType.Lastfm);
    try {
      await this.indexingService.quietAddUserToGuild(discordID, this.guild.id);
    } catch (e) {
      console.log(e);
    }
  }
}
