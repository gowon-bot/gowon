import { BaseCommand } from "../../lib/command/BaseCommand";
import { CommandManager } from "../../lib/command/CommandManager";
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

  commandManager = new CommandManager();
  adminService = new AdminService(this.gowonClient);

  async run() {
    await this.commandManager.init();

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Quick help")
    ).setDescription(`Welcome to Gowon! ${Emoji.gowonPeek}
      
To see a list of all commands see \`${this.prefix}help all\`
To change prefix, run \`@Gowon prefix <prefix>\` (the current prefix is \`${this.prefix}\`)

More questions? Come visit the support server: https://discord.gg/9Vr7Df7TZf`);

    await this.send(embed);
  }
}
