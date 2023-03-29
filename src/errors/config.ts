import { code } from "../helpers/discord";
import { ClientError } from "./errors";

export class PatronOptionsUsedWithoutBeingPatron extends ClientError {
  name = "PatronOptionsUsedWithoutBeingPatron";

  constructor(config: string[], prefix: string) {
    super(
      `You need to be a patron to use the following options: ${config.map(
        code
      )}\n See \`${prefix}patreon\` for more information.`
    );
  }
}
