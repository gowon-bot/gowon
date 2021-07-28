import { User } from "../../../database/entity/User";
import { displayNumber } from "../../views/displays";
import {
  AnyIn,
  BaseCompoundComponent,
} from "../components/BaseNowPlayingComponent";
import { getArtistPlays } from "../helpers/artist";
import { getCombo, playsQuery } from "../helpers/combo";

const playsInARowRequirements = [
  "artistInfo",
  "artistPlays",
  "artistCrown",
] as const;

export class ArtistPlaysInARowComponent extends BaseCompoundComponent<
  typeof playsInARowRequirements
> {
  requirements = playsInARowRequirements;

  static componentName = "artist-plays-in-a-row";
  static replaces = [
    "artist-plays",
    "artist-combo",
    new AnyIn(["artist-crown"]),
  ];

  async present() {
    const crown = this.values.artistCrown;
    const combo = await getCombo(playsQuery(this.nowPlaying), this.values);
    const { plays, name } = getArtistPlays(this.values);

    let crownString = "";
    let isCrownHolder = false;

    if (
      this.values.components.includes("artist-crown") &&
      crown &&
      crown.user
    ) {
      if (crown.user.id === this.values.message.author.id) {
        isCrownHolder = true;
      } else {
        if (await User.stillInServer(this.values.message, crown.user.id)) {
          crownString = `👑 ${displayNumber(crown.crown.plays)} (${
            crown.user.username
          })`;
        }
      }
    }

    if (plays !== undefined && name) {
      const component = {
        size: 2,
        string:
          `${isCrownHolder ? "👑" : ""}${displayNumber(
            plays,
            `${name} scrobble`
          )}` +
          (combo.artist.plays > 1
            ? ` (${displayNumber(combo.artist.plays)} in a row${
                combo.artist.plays > 100 ? " 🔥" : ""
              })`
            : ""),
      };

      return isCrownHolder
        ? component
        : [
            component,
            {
              size: 1,
              string: crownString,
              placeAfter: ["track-plays", "album-plays", "artist-plays"],
            },
          ];
    }

    return {
      string: `No data on last.fm for ${this.nowPlaying.artist}`,
      size: 2,
    };
  }
}
