import { BaseCommand } from "../../lib/command/BaseCommand";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";

import { Emoji } from "../../lib/Emoji";

const args = {} as const;

export default class QuickHelp extends BaseCommand<typeof args> {
  idSeed = "hot issue mayna";

  subcategory = "about";
  description = "Displays a quick help menu";
  usage = [""];

  arguments: Arguments = args;

  commandRegistry = new CommandRegistry();
  adminService = new AdminService(this.gowonClient);

  async run() {
    await this.commandRegistry.init();

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Quick help")
    ).setDescription(`Welcome to Gowon! ${Emoji.gowonPeek}
      
Use \`${this.prefix}login\` to login
To see a list of all commands see \`${this.prefix}help all\`
To change prefix, run \`@Gowon prefix <prefix>\` (the current prefix is \`${this.prefix}\`)

More questions? Come visit the support server: https://discord.gg/9Vr7Df7TZf`);

    await this.send(embed);
  }
}
