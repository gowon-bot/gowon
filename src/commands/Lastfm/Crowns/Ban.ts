import { LogicError } from "../../../errors";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} as const;

export class Ban extends CrownsChildCommand<typeof args> {
  idSeed = "loona chuu";

  description = "Bans a user from the crowns game";
  usage = "@user";
  arguments = args;

  adminCommand = true;

  async run() {
    let { mentionedDBUser, senderUser, discordUser } = await this.parseMentions(
      {
        fetchDiscordUser: true,
        reverseLookup: { required: true },
      }
    );

    if (!mentionedDBUser) throw new LogicError("please mention a valid user");

    if (mentionedDBUser.discordID === senderUser?.discordID)
      throw new LogicError("you can't crown ban yourself?");

    await this.crownsService.banUser(this.ctx, mentionedDBUser);
    this.crownsService.scribe.ban(
      this.ctx,
      mentionedDBUser,
      this.message.author,
      discordUser!
    );

    await this.traditionalReply(
      `successfully banned ${
        (await mentionedDBUser.toDiscordUser(this.guild))!.username
      }`
    );
  }
}
