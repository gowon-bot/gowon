import { DiscordService } from "../../../services/Discord/DiscordService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { displayNumber } from "../../ui/displays";
import { BaseCompoundComponent } from "../base/BaseNowPlayingComponent";
import { getArtistPlays } from "../helpers/artist";

const dependencies = ["artistInfo", "artistCount", "artistCrown"] as const;

export class ArtistPlaysAndCrownComponent extends BaseCompoundComponent<
  typeof dependencies
> {
  dependencies = dependencies;

  static componentName = "artist-plays-and-crown";
  static replaces = ["artist-plays", "artist-crown"];

  async render() {
    const crown = this.values.artistCrown;

    let crownString = "";
    let isCrownHolder = false;

    if (crown && crown.user) {
      if (crown.user.id === this.ctx.author.id) {
        isCrownHolder = true;
      } else {
        const userInServer = !crown.user
          ? false
          : await ServiceRegistry.get(DiscordService).userInServer(
              this.ctx,
              crown.user?.id
            );

        if (userInServer) {
          crownString = `👑 ${displayNumber(crown.crown.plays)} (${
            crown.user.username
          })`;
        }
      }
    }

    let artistPlaysString = "";
    let artistExists = false;

    const { plays, name } = getArtistPlays(this.values);

    if (plays !== undefined && name) {
      artistPlaysString = `${displayNumber(plays, `${name} scrobble`)}`;
      artistExists = true;
    } else {
      artistPlaysString = `No data on last.fm for ${this.nowPlaying.artist}`;
    }

    return !artistExists
      ? { string: artistPlaysString, size: 1 }
      : isCrownHolder
      ? { string: "👑 " + artistPlaysString, size: 1 }
      : [
          { string: `${artistPlaysString}`, size: 1 },
          {
            string: crownString,
            size: 1,
            placeAfter: ["track-plays", "album-plays", "artist-plays"],
          },
        ];
  }
}
