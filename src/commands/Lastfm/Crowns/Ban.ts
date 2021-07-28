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
    let { mentionedDBUser, senderUser, discordUser } = await this.parseMentions(
      {
        fetchDiscordUser: true,
        reverseLookup: { required: true },
      }
    );

    if (!mentionedDBUser) throw new LogicError("please mention a valid user");

    if (mentionedDBUser.discordID === senderUser?.discordID)
      throw new LogicError("you can't crown ban yourself?");

    await this.crownsService.banUser(mentionedDBUser, this.guild.id);
    this.crownsService.scribe.ban(
      mentionedDBUser,
      this.message.author,
      discordUser!,
      this.guild.id
    );

    await this.traditionalReply(
      `successfully banned ${
        (await mentionedDBUser.toDiscordUser(this.guild))!.username
      }`
    );
  }
}
