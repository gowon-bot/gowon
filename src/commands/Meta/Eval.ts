import { Command } from "../../lib/command/Command";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  script: new StringArgument({ index: { start: 0 }, required: true }),
} satisfies ArgumentsMap;

export default class Eval extends Command<typeof args> {
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

    const embed = this.authorEmbed()
      .setHeader("Eval")
      .setDescription(`\`\`\`\n${result}\n\`\`\``);

    await this.send(embed);
  }
}
