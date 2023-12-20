import { MentionedUserRequiredError } from "../../../errors/user";
import { code } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Ban extends CrownsChildCommand<typeof args> {
  idSeed = "loona chuu";

  description = "Bans a user from the crowns game";
  usage = "@user";
  arguments = args;

  variations: Variation[] = [
    {
      name: "unban",
      variation: "unban",
      description: "Unbans a user from the crowns game",
      separateSlashCommand: true,
    },
  ];

  adminCommand = true;

  async run() {
    const { mentionedDBUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
    });

    const unban = this.extract.didMatch("unban");

    if (!mentionedDBUser) throw new MentionedUserRequiredError();

    if (unban) {
      await this.crownsService.unbanUser(this.ctx, mentionedDBUser);

      this.crownsService.scribe.unban(
        this.ctx,
        mentionedDBUser,
        this.payload.author,
        discordUser!
      );
    } else {
      await this.crownsService.banUser(this.ctx, mentionedDBUser);

      this.crownsService.scribe.ban(
        this.ctx,
        mentionedDBUser,
        this.payload.author,
        discordUser!
      );
    }

    const embed = this.authorEmbed()
      .setHeader(`Crowns ${unban ? "un" : ""}ban`)
      .setDescription(
        `Successfully ${unban ? "un" : ""}banned ${code(
          discordUser?.username || "<unknown user>"
        )}`
      );

    await this.send(embed);
  }
}
