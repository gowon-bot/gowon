import { CouldNotFindRatingError } from "../../../errors/commands/library";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayRating } from "../../../lib/ui/displays";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export class Rating extends RateYourMusicChildCommand<typeof args> {
  idSeed = "sonamoo newsun";
  description = "Shows what you've rated an album";

  arguments = args;

  slashCommand = true;

  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  async run() {
    const { senderRequestable, dbUser } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
      reverseLookup: { required: true },
      syncedRequired: true,
    });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const ratings = await this.lilacRatingsService.ratings(this.ctx, {
      user: { discordID: dbUser.discordID },
      album: { name: album, artist: { name: artist } },
      pagination: { perPage: 1, page: 1 },
    });

    if (!ratings.pagination.totalItems) {
      throw new CouldNotFindRatingError();
    }

    const { rating, rateYourMusicAlbum } = ratings.ratings[0];

    const albumInfo = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
    });

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      albumInfo.images.get("large"),
      { metadata: { artist, album } }
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `${rateYourMusicAlbum.artistName} - ${rateYourMusicAlbum.title}`
      )
      .setDescription(`Your rating: ${displayRating(rating)}`)
      .setThumbnail(albumCover);

    await this.reply(embed);
  }
}
