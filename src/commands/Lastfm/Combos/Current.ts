import { formatDistance } from "date-fns";
import { ucFirst } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import {
  Combo as ComboType,
  ComboCalculator,
} from "../../../lib/calculators/ComboCalculator";
import { StringArrayArgument } from "../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { Paginator } from "../../../lib/paginators/Paginator";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import {
  displayAlbumLink,
  displayArtistLink,
  displayNumber,
  displayTrackLink,
} from "../../../lib/views/displays";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ComboChildCommand } from "./ComboChildCommand";

const args = {
  artists: new StringArrayArgument({
    index: { start: 0 },
    splitOn: "|",
    default: [],
    description: "The artists to count as part of your combo",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

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

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    artists: new validators.LengthRangeValidator({ max: 10 }),
  };

  artistsService = ServiceRegistry.get(ArtistsService);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  async run() {
    let artists = this.parsedArguments.artists;

    if (artists.length) {
      artists = await this.artistsService.correctArtistNames(this.ctx, artists);
    }

    const { requestable, username, perspective, senderUser } =
      await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.constants.hardPageLimit,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const comboCalculator = new ComboCalculator(this.ctx, artists);

    const combo = await comboCalculator.calculate(paginator);

    let comboSaved = false;
    let thresholdNotMet = false;

    if (
      !artists.length &&
      combo.hasAnyConsecutivePlays() &&
      !perspective.different &&
      senderUser
    ) {
      if (this.comboService.shouldSaveCombo(this.ctx, combo)) {
        await this.comboService.saveCombo(this.ctx, combo, senderUser);
        comboSaved = true;
      } else {
        thresholdNotMet = true;
      }
    }

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        string:
          this.displayCurrentCombo(combo, "artist") +
          ` (${combo.artistNames.map((a) => displayArtistLink(a)).join(", ")})`,
        shouldDisplay: combo.artist.plays > 1,
      },
      {
        string:
          this.displayCurrentCombo(combo, "album") +
          ` (${displayAlbumLink(combo.artistName, combo.albumName, true)})`,
        shouldDisplay: combo.album.plays > 1,
      },
      {
        string:
          this.displayCurrentCombo(combo, "track") +
          ` (${displayTrackLink(combo.artistName, combo.trackName)})`,
        shouldDisplay: combo.track.plays > 1,
      },
      `\n_Comboing for ${formatDistance(
        combo.firstScrobble.scrobbledAt,
        combo.lastScrobble.scrobbledAt
      )}_`
    );

    const embed = this.newEmbed()
      .setAuthor({
        ...this.generateEmbedAuthor(
          `${perspective.upper.possessive.replace(/`/g, "")} ongoing streaks`
        ),
        url: LinkGenerator.userPage(username),
      })
      .setDescription(
        combo.hasAnyConsecutivePlays()
          ? lineConsolidator.consolidate()
          : "No streaks found!"
      )
      .setFooter({
        text: comboSaved
          ? `This combo has been saved! See ${this.prefix}combos to see all your combos`
          : thresholdNotMet
          ? `Only combos with more than ${displayNumber(
              this.comboService.getThreshold(this.ctx),
              "play"
            )} are saved.`
          : "",
      });

    if (combo.hasAnyConsecutivePlays()) {
      const nowplaying = await this.lastFMService.nowPlaying(
        this.ctx,
        requestable
      );

      const albumCover = await this.albumCoverService.get(
        this.ctx,
        nowplaying.images.get("large"),
        {
          metadata: { artist: nowplaying.artist, album: nowplaying.album },
        }
      );

      embed.setThumbnail(albumCover || "");
    } else {
      embed.setFooter({
        text: "A streak is when you loop the same artist/album/track more than once",
      });
    }

    await this.send(embed);
  }

  private displayCurrentCombo(
    combo: ComboType,
    entity: "artist" | "album" | "track"
  ): string {
    return `${bold(ucFirst(entity))}: ${displayNumber(combo[entity].plays)}${
      combo[entity].plays >= 1000
        ? ` ${Emoji.gowonLitDance}`
        : combo[entity].plays >= 100
        ? this.isEnya(this.author.id)
          ? "💹"
          : "🔥"
        : combo[entity].hitMax
        ? "+"
        : combo[entity].nowplaying
        ? "➚"
        : ""
    } in a row`;
  }

  private isEnya(discordID: string) {
    return this.gowonClient.isDeveloperOf("rem", discordID);
  }
}
