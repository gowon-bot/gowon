import { ClientError } from "./errors";

export class URLCannotBeBlankError extends ClientError {
  name = "URLCannotBeBlankError";

  constructor() {
    super("Can't create an alternate album cover without a URL");
  }
}
