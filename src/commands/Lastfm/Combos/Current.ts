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
import { LinkGenerator } from "../../../helpers/lastFM";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";
import { Emoji } from "../../../lib/Emoji";
import { ComboChildCommand } from "./ComboChildCommand";
import { formatDistance } from "date-fns";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

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

export class Current extends ComboChildCommand<typeof args> {
  idSeed = "wooah wooyeon";

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

  redirectsService = ServiceRegistry.get(RedirectsService);
  artistsService = ServiceRegistry.get(ArtistsService);

  async run() {
    let artists = this.parsedArguments.artists!;

    if (artists.length) {
      artists = await this.artistsService.correctArtistNames(this.ctx, artists);
    }

    const { requestable, username, perspective, senderUser } =
      await this.parseMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.constants.hardPageLimit,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const comboCalculator = new ComboCalculator(this.redirectsService, artists);

    const combo = await comboCalculator.calculate(paginator);

    let comboSaved = false;

    if (
      !artists.length &&
      combo.hasAnyConsecutivePlays() &&
      !perspective.different &&
      senderUser
    ) {
      await this.comboService.saveCombo(this.ctx, combo, senderUser);
      comboSaved = true;
    }

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        string:
          this.displayCurrentCombo(combo, "artist") +
          ` (${combo.artistNames
            .map((a) => displayLink(a, LinkGenerator.artistPage(a)))
            .join(", ")})`,
        shouldDisplay: combo.artist.plays > 1,
      },
      {
        string:
          this.displayCurrentCombo(combo, "album") +
          ` (${displayLink(
            combo.album.name,
            LinkGenerator.albumPage(combo.artistName, combo.albumName)
          ).italic()})`,
        shouldDisplay: combo.album.plays > 1,
      },
      {
        string:
          this.displayCurrentCombo(combo, "track") +
          ` (${displayLink(
            combo.track.name,
            LinkGenerator.trackPage(combo.artistName, combo.trackName)
          )})`,
        shouldDisplay: combo.track.plays > 1,
      },
      `\n_Comboing for ${formatDistance(
        combo.firstScrobble.scrobbledAt,
        combo.lastScrobble.scrobbledAt
      )}_`
    );

    const embed = this.newEmbed()
      .setAuthor(
        ...this.generateEmbedAuthor(
          `${perspective.upper.possessive.replace(/`/g, "")} ongoing streaks`
        ),
        LinkGenerator.userPage(username)
      )
      .setDescription(
        combo.hasAnyConsecutivePlays()
          ? lineConsolidator.consolidate()
          : "No streaks found!"
      )
      .setFooter(
        comboSaved
          ? `This combo has been saved! See ${this.prefix}combos to see all your combos`
          : ""
      );

    if (combo.hasAnyConsecutivePlays()) {
      const nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      embed.setThumbnail(nowplaying.images.get("large")!);
    } else {
      embed.setFooter(
        "A streak is when you loop the same artist/album/track more than once"
      );
    }

    await this.send(embed);
  }

  private displayCurrentCombo(
    combo: ComboType,
    entity: "artist" | "album" | "track"
  ): string {
    return `${ucFirst(entity).strong()}: ${displayNumber(combo[entity].plays)}${
      combo[entity].plays >= 1000
        ? ` ${Emoji.gowonLitDance}`
        : combo[entity].plays >= 100
        ? this.isMex(this.author.id)
          ? "💹"
          : "🔥"
        : combo[entity].hitMax
        ? "+"
        : combo[entity].nowplaying
        ? "➚"
        : ""
    } in a row`;
  }

  private isMex(discordID: string) {
    return this.gowonClient.isDeveloperOf("rem", discordID);
  }
}
