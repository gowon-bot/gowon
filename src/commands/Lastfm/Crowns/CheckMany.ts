import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { toInt } from "../../../helpers/lastFM";
import { asyncMap } from "../../../helpers";

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

    const { requestable } = await this.getMentions();

    if (!artists) {
      artists = [
        (await this.lastFMService.nowPlaying(this.ctx, requestable)).artist,
      ];
    }

    const artistDetailsList = await asyncMap(artists, (artist) =>
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      })
    );

    const checkedCrowns = await asyncMap(artistDetailsList, (ad) =>
      this.crownsService.checkCrown(this.ctx, {
        artistName: ad.name,
        plays: toInt(ad.userPlaycount),
      })
    );

    checkedCrowns.forEach((cc) =>
      this.crownsService.scribe.handleCheck(this.ctx, cc, message)
    );

    const display = checkedCrowns.reduce((acc, cc, idx) => {
      acc[cc.state] = acc[cc.state] ?? [];

      acc[cc.state].push(artistDetailsList[idx].name);

      return acc;
    }, {} as CheckedCrownsDisplay);

    const embed = this.newEmbed()
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
