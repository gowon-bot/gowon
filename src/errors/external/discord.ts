import { ClientError } from "../errors";

export class NotTextChannelError extends ClientError {
  name = "NotTextChannelError";

  constructor() {
    super("That channel is not a text channel!");
  }
}

// It is not possible to prevent users with Administrator permissions
// from using any commands deployed globally or specifically to their guild
export class SlashCommandCannotBeDevCommand extends ClientError {
  name = "SlashCommandCannotBeDevCommand";

  constructor() {
    super("A slash command cannot be a developer command!");
  }
}
