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

  ctx = this.generateContext({
    crownsService: this.crownsService,
  });

  async run() {
    let { mentionedDBUser, senderUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

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
