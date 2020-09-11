import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class Unban extends CrownsChildCommand {
  description = "Unbans a user from the crowns game";
  usage = "@user";
  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to unban from the crowns game" },
    },
  };

  async run() {
    let { dbUser, senderUser } = await this.parseMentionedUsername();

    if (!dbUser || dbUser.discordID === senderUser?.discordID) {
      throw new LogicError(`please mention a valid user`);
    }

    await this.crownsService.unbanUser(dbUser, this.guild.id);

    await this.reply(
      `successfully unbanned ${
        (await dbUser.toDiscordUser(this.message))!.username
      }`
    );
  }
}
