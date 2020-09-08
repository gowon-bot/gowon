import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";

interface CheckedCrownsDisplay {
  [state: string]: Array<string>;
}

export class CheckMany extends CrownsChildCommand {
  aliases = ["cm"];
  description = "Checks multiple crowns at once (max 10)";
  usage = ["", "artist1 | artist2 | artist3 ...artist10"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 }, splitOn: "|", join: false },
    },
  };

  async run(message: Message) {
    let artists = this.parsedArguments.artist as Array<string>;

    artists = artists.slice(0, 10);

    let { username } = await this.parseMentionedUsername();

    if (!artists) {
      artists = [(await this.lastFMService.nowPlayingParsed(username)).artist];
    }

    let artistDetailsList = await Promise.all(
      artists.map((artist) =>
        this.lastFMService.artistInfo({ artist, username })
      )
    );

    let crownChecks = artistDetailsList.map((ad) =>
      this.crownsService.checkCrown({
        message,
        discordID: message.author.id,
        artistName: ad.name,
        plays: ad.stats.userplaycount.toInt(),
      })
    );

    let checkedCrowns = await Promise.all(crownChecks);

    checkedCrowns.forEach((cc) =>
      this.crownsService.scribe.handleCheck(cc, message)
    );

    let display = checkedCrowns.reduce((acc, cc, idx) => {
      acc[cc.state] = acc[cc.state] ?? [];

      acc[cc.state].push(artistDetailsList[idx].name);

      return acc;
    }, {} as CheckedCrownsDisplay);

    let embed = new MessageEmbed()
      .setTitle(`Crown checks for ${checkedCrowns.length} artists`)
      .setDescription(
        Object.keys(display).map(
          (state) =>
            `${state}: ${display[state].map((a) => a.code()).join(", ")}`
        )
      );

    await this.send(embed);
  }
}
