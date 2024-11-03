import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { Emoji } from "../../emoji/Emoji";
import { SettingsService } from "../../settings/SettingsService";
import { AnyIn, BaseCompoundComponent } from "../base/BaseNowPlayingComponent";

const lovedAndOwnedDependencies = [
  "trackInfo",
  "albumCard",
  "cachedLovedTrack",
] as const;

export class LovedAndOwnedComponent extends BaseCompoundComponent<
  typeof lovedAndOwnedDependencies
> {
  dependencies = lovedAndOwnedDependencies;

  static componentName = "loved-and-owned";
  static replaces = new AnyIn(["loved", "card-ownership"]);

  async render() {
    const settingsService = ServiceRegistry.get(SettingsService);

    const loved =
      this.values.trackInfo?.loved || !!this.values.cachedLovedTrack;
    const owned =
      this.values.albumCard &&
      this.values.albumCard.owner.id === this.values.dbUser.id;

    if (owned && loved) {
      return { size: 0, string: Emoji.sparklingHeart };
    } else if (owned) {
      return { size: 0, string: Emoji.sparkles };
    } else if (loved) {
      return {
        size: 0,
        string:
          settingsService.get("fmLovedEmoji", {
            userID: this.ctx.author.id,
          }) || Emoji.heart,
      };
    } else {
      return { string: "", size: 0 };
    }
  }
}
