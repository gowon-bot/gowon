import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class Ban extends CrownsChildCommand {
  description = "Bans a user from the crowns game";
  usage = "@user";
  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async run() {
    let { dbUser, senderUser } = await this.parseMentions();

    if (!dbUser) throw new LogicError("please mention a valid user");

    if (dbUser.discordID === senderUser?.discordID)
      throw new LogicError("you can't crown ban yourself?");

    await this.crownsService.banUser(dbUser, this.guild.id);
    this.crownsService.scribe.ban(
      dbUser,
      this.message.author,
      this.message.mentions.members!.array()[0].user,
      this.guild.id
    );

    await this.reply(
      `successfully banned ${
        (await dbUser.toDiscordUser(this.message))!.username
      }`
    );
  }
}
