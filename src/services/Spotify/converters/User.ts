import { RawSpotifyUser } from "../SpotifyService.types";
import { SpotifyEntityConverter } from "./BaseConverter";

export class SpotifyUser extends SpotifyEntityConverter<"user"> {
  constructor(user: RawSpotifyUser) {
    super({ ...user, name: user.display_name });
  }
}
