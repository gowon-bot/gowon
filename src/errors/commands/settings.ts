import { code } from "../../helpers/discord";
import { ClientError } from "../errors";

export class InvalidChoiceError extends ClientError {
  name = "InvalidChoiceError";

  constructor(choices: string[]) {
    super(
      `Not a valid setting value! Please pick one from the following choices: ${choices
        .map(code)
        .join(", ")}`
    );
  }
}
