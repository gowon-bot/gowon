import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMService } from "../../services/LastFM/LastFMService";

const args = {
  inputs: {
    script: { index: { start: 0 } },
  },
} as const;

export default class Eval extends BaseCommand<typeof args> {
  idSeed = "redsquare ari";

  description = "Not for you to run >:(";
  secretCommand = true;
  devCommand = true;

  arguments: Arguments = args;

  validation: Validation = {
    script: new validators.Required({}),
  };

  lastFMService = new LastFMService(this.logger);

  async run() {
    const result = eval(this.parsedArguments.script!);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Eval"))
      .setDescription(`\`\`\`\n${result}\n\`\`\``);

    await this.send(embed);
  }
}
