import { ClientError } from "../errors";

export class UserNotSignedInOrDoesNotHaveAnyCrownsError extends ClientError {
  constructor() {
    super("That user isn't logged into the bot or doesn't have any crowns!");
  }
}

export class InvalidTopArgumentError extends ClientError {
  constructor() {
    super("Please enter a valid number (between 2 and 1,000)");
  }
}
