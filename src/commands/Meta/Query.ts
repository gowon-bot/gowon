import { getConnection } from "typeorm";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Logger } from "../../lib/Logger";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";

const args = {
  query: new StringArgument({ index: { start: 0 }, required: true }),
} as const;

export default class Query extends BaseCommand<typeof args> {
  idSeed = "gfriend sowon";

  description = "Query the database";
  subcategory = "developer";
  devCommand = true;

  arguments = args;

  validation: Validation = {
    query: new validators.Required({}),
  };

  async run() {
    // Permissions failsafe
    if (this.author.id !== "267794154459889664") {
      return;
    }

    let connection = getConnection();

    let result = await connection.query(this.parsedArguments.query);

    await this.send("```" + Logger.formatObject(result) + "```");
  }
}
