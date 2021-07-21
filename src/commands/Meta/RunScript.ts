import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { ScriptsManager } from "../../services/ScriptsManager";

const args = {
  inputs: {
    script: { index: 0 },
  },
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

  scriptsManager = new ScriptsManager();

  async run() {
    await this.scriptsManager.init();

    const script = this.parsedArguments.script!;

    this.scriptsManager.runScript(script, this);

    await this.reply(`Running script ${script.code()}`);
  }
}
