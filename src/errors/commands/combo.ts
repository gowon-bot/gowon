import { Perspective } from "../../lib/Perspective";
import { ClientError } from "../errors";

export class NoServerCombosError extends ClientError {
  name = "NoServerCombosError";

  constructor(prefix: string, artistName: string | undefined) {
    super(
      `This server doesn't have any ${
        artistName ? `${artistName} ` : ""
      }combos saved yet! \`${prefix}combo\` saves your combo`
    );
  }
}

export class NoUserCombosError extends ClientError {
  name = "NoUserCombosError";

  constructor(
    perspective: Perspective,
    prefix: string,
    artistName: string | undefined
  ) {
    super(
      `${perspective.plusToHave} no ${
        artistName ? `${artistName} ` : ""
      }combos saved yet! \`${prefix}combo\` saves your combo`
    );
  }
}
