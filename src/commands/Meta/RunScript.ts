import { BaseCommand } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { ScriptsRegistry } from "../../services/ScriptsRegistry";

const args = {
  script: new StringArgument({ index: 0, required: true }),
} as const;

export default class RunScript extends BaseCommand<typeof args> {
  idSeed = "hot issue hyeongshin";
  description = "Run a script";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  arguments = args;

  validation: Validation = {
    script: new validators.Required({}),
  };

  scriptsRegistry = new ScriptsRegistry();

  async run() {
    await this.scriptsRegistry.init();

    const script = this.parsedArguments.script;

    this.scriptsRegistry.runScript(script, this);

    await this.reply(`Running script ${script.code()}`);
  }
}
