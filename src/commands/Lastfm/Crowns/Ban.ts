import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class Ban extends CrownsChildCommand {
  description = "Bans a user from the crowns game";
  usage = "@user";
  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to ban from the crowns game" },
    },
  };

  async run() {
    let { dbUser, senderUser } = await this.parseMentionedUsername();

    if (!dbUser || dbUser.discordID === senderUser?.discordID) {
      throw new LogicError(`please mention a valid user`);
    }

    await this.crownsService.banUser(dbUser);

    await this.reply(
      `successfully banned ${
        (await dbUser.toDiscordUser(this.message))!.username
      }`
    );
  }
}


