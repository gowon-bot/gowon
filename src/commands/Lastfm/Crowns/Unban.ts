import { LogicError } from "../../../errors/errors";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
};

export class Unban extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn yeonjung";

  description = "Unbans a user from the crowns game";
  usage = "@user";
  arguments = args;

  adminCommand = true;

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
      this.payload.author,
      discordUser!
    );

    await this.traditionalReply(
      `successfully unbanned ${
        (await mentionedDBUser.toDiscordUser(this.requiredGuild))!.username
      }`
    );
  }
}
