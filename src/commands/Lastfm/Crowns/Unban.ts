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

  ctx = this.generateContext({
    crownsService: this.crownsService,
  });

  async run() {
    let { mentionedDBUser, senderUser, discordUser } = await this.getMentions({
      reverseLookup: { required: true },
      fetchDiscordUser: true,
    });

    if (
      !mentionedDBUser ||
      mentionedDBUser.discordID === senderUser?.discordID
    ) {
      throw new LogicError(`please mention a valid user`);
    }

    await this.crownsService.unbanUser(this.ctx, mentionedDBUser);
    this.crownsService.scribe.unban(
      this.ctx,
      mentionedDBUser,
      this.message.author,
      discordUser!
    );

    await this.traditionalReply(
      `successfully unbanned ${
        (await mentionedDBUser.toDiscordUser(this.guild))!.username
      }`
    );
  }
}
