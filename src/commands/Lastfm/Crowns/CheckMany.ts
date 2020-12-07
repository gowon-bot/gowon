import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

interface CheckedCrownsDisplay {
  [state: string]: Array<string>;
}

export class CheckMany extends CrownsChildCommand {
  idSeed = "weki meki suyeon";

  aliases = ["cm"];
  description = "Checks multiple crowns at once (max 10)";
  usage = ["", "artist1 | artist2 | artist3 ...artist10"];

  arguments: Arguments = {
    inputs: {
      artists: { index: { start: 0 }, splitOn: "|", join: false },
    },
  };

  validation: Validation = {
    artists: new validators.LengthRange({ min: 1, max: 10 }),
  };

  async run(message: Message) {
    let artists = this.parsedArguments.artists as string[];

    let { username } = await this.parseMentions();

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

    let embed = this.newEmbed()
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
