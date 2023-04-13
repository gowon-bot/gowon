import { asyncMap } from "../../../helpers";
import { code } from "../../../helpers/discord";
import { SimpleMap } from "../../../helpers/types";
import { StringArrayArgument } from "../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";

type CheckedCrownsDisplay = SimpleMap<string[]>;

const args = {
  artists: new StringArrayArgument({
    index: { start: 0 },
    splitOn: "|",
  }),
} satisfies ArgumentsMap;

export class CheckMany extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki suyeon";

  aliases = ["cm"];
  description = "Checks multiple crowns at once (max 10)";
  usage = ["", "artist1 | artist2 | artist3 ...artist10"];

  arguments = args;

  validation: Validation = {
    artists: new validators.LengthRangeValidator({ min: 1, max: 10 }),
  };

  async run() {
    const { requestable, senderUser } = await this.getMentions({
      dbUserRequired: true,
      senderRequired: true,
    });

    await this.ensureUserCanCheck(senderUser!);

    const artists = this.parsedArguments.artists || [
      (await this.lastFMService.nowPlaying(this.ctx, requestable)).artist,
    ];

    const artistDetailsList = await asyncMap(artists, (artist) =>
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      })
    );

    const checkedCrowns = await asyncMap(artistDetailsList, (ad) =>
      this.crownsService.check(this.ctx, {
        artistName: ad.name,
        plays: ad.userPlaycount,
        senderDBUser: senderUser!,
      })
    );

    checkedCrowns.forEach((cc) => {
      if (cc.shouldRecordHistory()) {
        this.crownsService.scribe.handleCheck(this.ctx, cc);
      }
    });

    const display = checkedCrowns.reduce((acc, cc, idx) => {
      acc[cc.displayName] ??= [];

      acc[cc.displayName].push(artistDetailsList[idx].name);

      return acc;
    }, {} as CheckedCrownsDisplay);

    const embed = this.newEmbed()
      .setTitle(`Crown checks for ${checkedCrowns.length} artists`)
      .setDescription(
        Object.keys(display)
          .map(
            (state) =>
              `${state}: ${display[state].map((a) => code(a)).join(", ")}`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
