import { User } from "../../../database/entity/User";
import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistCrownRequirements = ["artistCrown"] as const;

export class ArtistCrownComponent extends BaseNowPlayingComponent<
  typeof artistCrownRequirements
> {
  static componentName = "artist-crown";
  static friendlyName = "Artist crown";
  readonly requirements = artistCrownRequirements;

  async present() {
    if (this.values.artistCrown) {
      const crown = this.values.artistCrown!;

      if (await User.stillInServer(this.ctx, crown.user?.id)) {
        return {
          string: `👑 ${displayNumber(crown.crown.plays)} (${
            crown.user!.username
          })`,
          size: 1,
        };
      }
    }

    return {
      string: "",
      size: 0,
    };
  }
}
