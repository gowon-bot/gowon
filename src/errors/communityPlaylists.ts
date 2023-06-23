import { ClientError } from "./errors";

export class UserAlreadySubmittedError extends ClientError {
  name = "UserAlreadySubmittedError";

  constructor() {
    super(`That user has already submitted to this playlist!`);
  }
}
