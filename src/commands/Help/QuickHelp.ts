import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/emoji/Emoji";

export default class QuickHelp extends Command {
  idSeed = "hot issue mayna";

  subcategory = "about";
  description = "Displays a quick help menu";
  usage = [""];

  async run() {
    const embed = this.newEmbed()
      .setAuthor(
        this.generateEmbedAuthor(
          this.ctx.isDM() ? "Quick help in DMs" : "Quick help"
        )
      )
      .setDescription(
        `Welcome to Gowon! ${Emoji.gowonPeek}
      
Use \`${this.prefix}login\` to login
To see a list of all commands see \`${this.prefix}help all\`, or visit https://gowon.ca/commands
To change prefix, run \`@Gowon prefix <prefix>\` (the current prefix is \`${this.prefix}\`)

Curious how Gowon uses your data? https://gowon.ca/privacy
More questions? Come visit the support server: https://discord.gg/9Vr7Df7TZf` +
          (this.ctx.isDM()
            ? `\n\nOnly certain commands can be run in DMs. Simply use the default prefix \`${this.prefix}\`, and run commands like you would normally`
            : "")
      );

    await this.send(embed);
  }
}
