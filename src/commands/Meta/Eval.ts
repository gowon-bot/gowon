import { BaseCommand } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  script: new StringArgument({ index: { start: 0 }, required: true }),
} as const;

export default class Eval extends BaseCommand<typeof args> {
  idSeed = "redsquare ari";

  subcategory = "developer";
  description = "Not for you to run >:(";
  devCommand = true;

  arguments = args;

  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    // Permissions failsafe
    if (this.author.id !== "267794154459889664") {
      return;
    }

    const result = eval(this.parsedArguments.script);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Eval"))
      .setDescription(`\`\`\`\n${result}\n\`\`\``);

    await this.send(embed);
  }
}
