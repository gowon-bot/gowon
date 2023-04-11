import { ClientError } from "../errors";

export class NotTextChannelError extends ClientError {
  name = "NotTextChannelError";

  constructor() {
    super("That channel is not a text channel!");
  }
}
