import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { ucFirst } from "../../../helpers";
import { Paginator } from "../../../lib/paginators/Paginator";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import {
  ComboCalculator,
  Combo as ComboType,
} from "../../../lib/calculators/ComboCalculator";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";

const args = {
  inputs: {
    artists: {
      index: { start: 0 },
      splitOn: "|",
      join: false,
    },
  },
  mentions: standardMentions,
} as const;

export default class Combo extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah wooyeon";
  aliases = ["streak", "str"];
  description = `Shows your current streak\n Max combo: ${displayNumber(
    this.gowonService.constants.hardPageLimit * 1000
  )}`;
  subcategory = "library stats";
  usage = [
    "",
    "artist1 | artist2 | artistn... (artists to count when checking for consecutive plays)",
  ];

  arguments: Arguments = args;

  validation: Validation = {
    artists: new validators.LengthRange({ max: 10 }),
  };

  redirectsService = new RedirectsService(this.logger);
  artistsService = new ArtistsService(this.logger);

  async run() {
    let artists = this.parsedArguments.artists!;

    if (artists.length) {
      artists = await this.artistsService.correctArtistNames(artists);
    }

    let { requestable, username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.constants.hardPageLimit,
      { username: requestable, limit: 1000 }
    );

    let comboCalculator = new ComboCalculator(this.redirectsService, artists);

    let combo = await comboCalculator.calculate(paginator);

    let lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        string:
          this.displayCombo(combo, "artist") +
          ` (${sanitizeForDiscord(combo.artistNames.join(", "))})`,
        shouldDisplay: combo.artist.plays > 1,
      },
      {
        string:
          this.displayCombo(combo, "album") + ` (${combo.album.name.italic()})`,
        shouldDisplay: combo.album.plays > 1,
      },
      {
        string: this.displayCombo(combo, "track") + ` (${combo.track.name})`,
        shouldDisplay: combo.track.plays > 1,
      }
    );

    let embed = this.newEmbed()
      .setTitle(
        `Streak for ${username} (from recent ${displayNumber(
          comboCalculator.totalTracks,
          "track"
        )})`
      )
      .setURL(LinkGenerator.userPage(username))
      .setDescription(
        combo.hasAnyConsecutivePlays()
          ? lineConsolidator.consolidate()
          : "No consecutive plays found!"
      );

    await this.send(embed);
  }

  private displayCombo(
    combo: ComboType,
    entity: "artist" | "album" | "track"
  ): string {
    return `${ucFirst(entity)}: ${combo[entity].plays}${
      combo[entity].hitMax ? "+" : combo[entity].nowplaying ? "➚" : ""
    } in a row`;
  }
}
