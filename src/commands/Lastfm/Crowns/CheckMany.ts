import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { toInt } from "../../../helpers/lastFM";

interface CheckedCrownsDisplay {
  [state: string]: Array<string>;
}

const args = {
  inputs: {
    artists: { index: { start: 0 }, splitOn: "|", join: false },
  },
} as const;

export class CheckMany extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki suyeon";

  aliases = ["cm"];
  description = "Checks multiple crowns at once (max 10)";
  usage = ["", "artist1 | artist2 | artist3 ...artist10"];

  arguments: Arguments = args;

  validation: Validation = {
    artists: new validators.LengthRange({ min: 1, max: 10 }),
  };

  async run(message: Message) {
    let artists = this.parsedArguments.artists;

    let { requestable } = await this.parseMentions();

    if (!artists) {
      artists = [(await this.lastFMService.nowPlaying(requestable)).artist];
    }

    let artistDetailsList = await Promise.all(
      artists.map((artist) =>
        this.lastFMService.artistInfo({ artist, username: requestable })
      )
    );

    let crownChecks = artistDetailsList.map((ad) =>
      this.crownsService.checkCrown({
        message,
        discordID: message.author.id,
        artistName: ad.name,
        plays: toInt(ad.userPlaycount),
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
        Object.keys(display)
          .map(
            (state) =>
              `${state}: ${display[state].map((a) => a.code()).join(", ")}`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
