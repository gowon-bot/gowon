import gql from "graphql-tag";
import { FriendsHaveNoRatingsError } from "../../../../errors/friends";
import { asyncMap } from "../../../../helpers";
import { average } from "../../../../helpers/stats";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import {
  displayNumber,
  displayNumberedList,
  displayRating,
} from "../../../../lib/views/displays";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { MirrorballRateYourMusicAlbum } from "../../../../services/mirrorball/MirrorballTypes";
import { AlbumCoverService } from "../../../../services/moderation/AlbumCoverService";
import { RatingResponse } from "../../Mirrorball/RateYourMusic/connectors";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export class Rating extends FriendsChildCommand<typeof args> {
  idSeed = "hot issue dana";

  description = "Shows what your friends have rated an album";
  aliases = ["ratings", "ra"];
  usage = ["", "artist | album"];

  arguments = args;

  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  async run() {
    const { senderRequestable, friends } = await this.getMentions({
      senderRequired: true,
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const query = gql`
      query friendsRatings($user: UserInput!, $album: AlbumInput!) {
        ratings(
          settings: { user: $user, album: $album, pageInput: { limit: 1 } }
        ) {
          ratings {
            rating
            rateYourMusicAlbum {
              title
              artistName
            }
          }
        }
      }
    `;

    const ratings: {
      discordID: string;
      rating: number | undefined;
      album: MirrorballRateYourMusicAlbum | undefined;
    }[] = await asyncMap(friends.discordIDs(), async (friendID) => {
      const ratingResponse = (await this.mirrorballService.query(
        this.ctx,
        query,
        {
          user: { discordID: friendID },
          album: { name: album, artist: { name: artist } },
        }
      )) as RatingResponse;

      return {
        discordID: friendID,
        rating: ratingResponse.ratings.ratings[0]?.rating,
        album: ratingResponse.ratings.ratings[0]?.rateYourMusicAlbum,
      };
    });

    const filteredRatings = ratings.filter((r) => !!r.rating);

    if (!filteredRatings.length) {
      throw new FriendsHaveNoRatingsError();
    }

    const rateYourMusicAlbum = filteredRatings[0].album!;

    const albumInfo = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
    });

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      albumInfo.images.get("large"),
      {
        metadata: { artist, album },
      }
    );

    const averageRating = average(filteredRatings.map((r) => r.rating!)) / 2;

    const description = `_Average ${averageRating.toFixed(
      2
    )}/5 from ${displayNumber(filteredRatings.length, "rating")}_\n\n`;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends rating"))
      .setTitle(
        `Your friends ratings of ${rateYourMusicAlbum.title} by ${rateYourMusicAlbum.artistName}`
      )
      .setDescription(
        description +
          displayNumberedList(
            filteredRatings
              .sort((a, b) => b.rating! - a.rating!)
              .map((r) => {
                const friend = friends.getFriend(r.discordID);

                return `${friend.display()} - ${displayRating(r.rating!)}`;
              })
          )
      )
      .setThumbnail(albumCover || "");

    await this.send(embed);
  }
}
