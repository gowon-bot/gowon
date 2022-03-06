import { BaseCommand } from "../../lib/command/BaseCommand";
import { AdminService } from "../../services/dbservices/AdminService";
import { Emoji } from "../../lib/Emoji";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class QuickHelp extends BaseCommand {
  idSeed = "hot issue mayna";

  subcategory = "about";
  description = "Displays a quick help menu";
  usage = [""];

  adminService = ServiceRegistry.get(AdminService);

  async run() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Quick help"))
      .setDescription(
        `Welcome to Gowon! ${Emoji.gowonPeek}
      
Use \`${this.prefix}login\` to login
To see a list of all commands see \`${this.prefix}help all\`, or visit https://gowon.ca/commands
To change prefix, run \`@Gowon prefix <prefix>\` (the current prefix is \`${this.prefix}\`)

Curious how Gowon uses your data? https://gowon.ca/privacy
More questions? Come visit the support server: https://discord.gg/9Vr7Df7TZf`
      );

    await this.send(embed);
  }
}
