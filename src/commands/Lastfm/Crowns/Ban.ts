import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  mentions: standardMentions,
} as const;

export class Ban extends CrownsChildCommand<typeof args> {
  idSeed = "loona chuu";

  description = "Bans a user from the crowns game";
  usage = "@user";
  arguments: Arguments = args;

  async run() {
    let { dbUser, senderUser, discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
    });

    if (!dbUser) throw new LogicError("please mention a valid user");

    if (dbUser.discordID === senderUser?.discordID)
      throw new LogicError("you can't crown ban yourself?");

    await this.crownsService.banUser(dbUser, this.guild.id);
    this.crownsService.scribe.ban(
      dbUser,
      this.message.author,
      discordUser!,
      this.guild.id
    );

    await this.reply(
      `successfully banned ${
        (await dbUser.toDiscordUser(this.guild))!.username
      }`
    );
  }
}
