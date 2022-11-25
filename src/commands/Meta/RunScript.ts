import { code } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { ScriptsRegistry } from "../../services/ScriptsRegistry";

const args = {
  script: new StringArgument({ index: 0, required: true }),
} satisfies ArgumentsMap;

export default class RunScript extends Command<typeof args> {
  idSeed = "hot issue hyeongshin";
  description = "Run a script";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  arguments = args;

  validation: Validation = {
    script: new validators.RequiredValidator({}),
  };

  scriptsRegistry = new ScriptsRegistry();

  async run() {
    await this.scriptsRegistry.init();

    const script = this.parsedArguments.script;

    this.scriptsRegistry.runScript(script, this.ctx);

    await this.reply(`Running script ${code(script)}`);
  }
}
