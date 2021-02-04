import { getConnection } from "typeorm";
import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Logger } from "../../lib/Logger";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";

const args = {
  inputs: {
    query: { index: { start: 0 } },
  },
} as const;

export default class Query extends BaseCommand<typeof args> {
  idSeed = "gfriend sowon";

  description = "Query the database";
  secretCommand = true;
  devCommand = true;

  arguments: Arguments = args;

  validation: Validation = {
    query: new validators.Required({}),
  };

  async run() {
    let connection = getConnection();

    let result = await connection.query(this.parsedArguments.query!);

    await this.send("```" + Logger.formatObject(result) + "```");
  }
}
