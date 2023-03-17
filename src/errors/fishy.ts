import { code } from "../helpers/discord";
import { ClientError } from "./errors";

export class FishyNotFoundError extends ClientError {
  name = "FishyNotFoundError";

  constructor(name?: string) {
    super(
      `Couldn't find a fishy with ${
        name ? `the name ${code(name)}` : "that name"
      }!`
    );
  }
}
