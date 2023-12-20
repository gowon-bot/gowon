import { chunkArray } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class DM extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki lucy";

  description = "Sends you a full list of a users crowns";
  aliases = ["me"];
  usage = ["", "@user"];

  arguments = args;

  readonly crownsPerMessage = 40;

  async run() {
    const { discordUser, dbUser } = await this.getMentions({
      fetchDiscordUser: true,
      dbUserRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(this.ctx, dbUser.id, -1),
      this.crownsService.count(this.ctx, dbUser.id),
    ]);

    const embed = this.authorEmbed()
      .setHeader("Crowns DM")
      .setDescription(
        `Sending you a list of ${perspective.possessive} crowns...`
      );

    await this.send(embed);

    const chunks = chunkArray(crowns, this.crownsPerMessage);

    chunks
      .map((chunk, chunkIdx) =>
        this.authorEmbed()
          .setHeader("Crowns DM")
          .setTitle(
            `Crowns ${chunkIdx * this.crownsPerMessage + 1}-${
              (chunkIdx + 1) * this.crownsPerMessage < crowns.length
                ? (chunkIdx + 1) * this.crownsPerMessage
                : crowns.length
            } of ${crownsCount}`
          )
          .setDescription(
            displayNumberedList(
              chunk.map(
                (c) =>
                  `${c.artistName} ― ${bold(displayNumber(c.plays, "play"))}`
              ),
              chunkIdx * this.crownsPerMessage
            )
          )
      )
      .forEach((e) => this.dmAuthor(e));
  }
}
