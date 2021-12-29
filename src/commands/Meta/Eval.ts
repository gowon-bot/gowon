import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  inputs: {
    script: { index: { start: 0 } },
  },
} as const;

export default class Eval extends BaseCommand<typeof args> {
  idSeed = "redsquare ari";

  subcategory = "developer";
  description = "Not for you to run >:(";
  devCommand = true;

  arguments: Arguments = args;

  validation: Validation = {
    script: new validators.Required({}),
  };

  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    // Permissions failsafe
    if (this.author.id !== "267794154459889664") {
      return;
    }

    const result = eval(this.parsedArguments.script!);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Eval"))
      .setDescription(`\`\`\`\n${result}\n\`\`\``);

    await this.send(embed);
  }
}
