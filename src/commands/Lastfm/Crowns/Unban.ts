import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  mentions: standardMentions,
};

export class Unban extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn yeonjung";

  description = "Unbans a user from the crowns game";
  usage = "@user";
  arguments: Arguments = args;

  async run() {
    let { dbUser, senderUser, discordUser } = await this.parseMentions({
      reverseLookup: { lastFM: true },
      fetchDiscordUser: true,
    });

    if (!dbUser || dbUser.discordID === senderUser?.discordID) {
      throw new LogicError(`please mention a valid user`);
    }

    await this.crownsService.unbanUser(dbUser, this.guild.id);
    this.crownsService.scribe.unban(
      dbUser,
      this.message.author,
      discordUser!,
      this.guild.id
    );

    await this.traditionalReply(
      `successfully unbanned ${
        (await dbUser.toDiscordUser(this.guild))!.username
      }`
    );
  }
}
