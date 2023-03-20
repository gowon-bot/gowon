import { Perspective } from "../lib/Perspective";
import { ClientError } from "./errors";

export class UserHasNoCrownsInServerError extends ClientError {
  name = "UserHasNoCrownsInServerError";

  constructor(perspective: Perspective) {
    super(`${perspective.plusToHave} no crowns in this server!`);
  }
}
