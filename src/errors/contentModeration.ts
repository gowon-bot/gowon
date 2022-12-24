import { ClientError } from "./errors";

export class AlternateCoverURLCannotBeBlankError extends ClientError {
  name = "URLCannotBeBlankError";

  constructor() {
    super("Can't create an alternate album cover without a URL");
  }
}

export class AlternateCoverAlreadyDoesNotExist extends ClientError {
  name = "AlternateCoverAlreadyDoesNotExist";

  constructor() {
    super("That album already doesn't have an alternate album cover!");
  }
}
