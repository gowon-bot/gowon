import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
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

const args = {
  inputs: {
    username: { index: 0 },
  },
  mentions: {
    user: { index: 0 },
    userID: { mention: new DiscordIDMention(true), index: 0 },
  },
} as const;

export default class Login extends LastFMBaseCommand<typeof args> {
  idSeed = "loona jinsoul";

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
      !this.message.member?.hasPermission("ADMINISTRATOR")
    ) {
      throw new LogicError(
        "you are not able to set usernames for other users!"
      );
    }

    if (username === "<username>") {
      await this.reply(
        "hint: you're supposed to replace <username> with your username".italic()
      );
      return;
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
      .setFooter(
        '"Indexing" means downloading all your last.fm data. This is required for many commands to function, and is recommended.'
      );

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    this.stopTyping();
    if (await confirmationEmbed.awaitConfirmation()) {
      await confirmationEmbed.sentMessage!.edit(
        embed.setDescription(
          embed.description + "\n\nIndexing... (this may take a while)"
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
      await confirmationEmbed.sentMessage!.edit(
        embed.setDescription(
          embed.description!.replace(
            "Indexing... (this may take a while)",
            "Indexed!"
          )
        )
      );
    }
  }

  private async handleIndexerLogin(discordID: string, username: string) {
    await this.indexingService.login(username, discordID, UserType.Lastfm);
    try {
      await this.indexingService.addUserToGuild(discordID, this.guild.id);
    } catch (e) {
      console.log(e);
    }
  }
}
