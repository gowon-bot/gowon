import { ClientError } from "./errors";

export class InvalidTimeZoneError extends ClientError {
  name = "InvalidTimeZoneError";

  constructor(prefix: string) {
    super(`That's not a valid timezone! See \`${prefix}tz\` for more info`);
  }
}
