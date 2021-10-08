import { CrownsChildCommand } from "./CrownsChildCommand";
import { chunkArray } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  mentions: standardMentions,
} as const;

export class DM extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki lucy";

  description = "Sends you a full list of a users crowns";
  aliases = ["me"];
  usage = ["", "@user"];

  arguments: Arguments = args;

  async run() {
    const crownsPerMessage = 40;

    const { discordUser: user } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
    });

    const discordID = user?.id || this.author.id;

    const perspective = this.usersService.discordPerspective(this.author, user);

    const [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(this.ctx, discordID, -1),
      this.crownsService.count(this.ctx, discordID),
    ]);

    this.traditionalReply(
      `sending you a list of ${perspective.possessive} crowns...`
    );

    const chunks = chunkArray(crowns, crownsPerMessage);

    this.dmAuthor(
      `${perspective.upper.plusToHave} ${displayNumber(
        crownsCount,
        "crown"
      )} in ${this.guild.name}`
    );

    chunks
      .map((chunk, chunkIdx) =>
        this.newEmbed()
          .setTitle(
            `Crowns ${chunkIdx * crownsPerMessage + 1} - ${
              (chunkIdx + 1) * crownsPerMessage < crowns.length
                ? (chunkIdx + 1) * crownsPerMessage
                : crowns.length
            }`
          )
          .setDescription(
            chunk
              .map(
                (c, i) =>
                  `${chunkIdx * crownsPerMessage + 1 + i}) ${
                    c.artistName
                  } ― ${displayNumber(c.plays, "play").strong()}`
              )
              .join("\n")
          )
      )
      .forEach((e) => this.dmAuthor(e));
  }
}
