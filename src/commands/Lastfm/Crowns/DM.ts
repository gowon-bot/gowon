import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay, chunkArray } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export class DM extends CrownsChildCommand {
  description = "DMs you a users crowns";
  aliases = ["me"];
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: standardMentions,
  };

  async run() {
    const crownsPerMessage = 40;

    let { discordUser: user } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { lastFM: true },
    });

    let discordID = user?.id || this.author.id;

    let perspective = this.usersService.discordPerspective(this.author, user);

    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(discordID, this.guild.id, -1),
      this.crownsService.count(discordID, this.guild.id),
    ]);

    this.reply(`sending you a list of ${perspective.possessive} crowns...`);

    let chunks = chunkArray(crowns, crownsPerMessage);

    this.author.send(
      `${perspective.upper.plusToHave} ${numberDisplay(
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
            chunk.map(
              (c, i) =>
                `${chunkIdx * crownsPerMessage + 1 + i}) ${
                  c.artistName
                } ― ${numberDisplay(c.plays, "play").bold()}`
            )
          )
      )
      .forEach((e) => this.author.send(e));
  }
}
