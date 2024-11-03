import { code } from "../../../../helpers/discord";
import {
  getComponents,
  sortConfigOptions,
} from "../../../../lib/nowplaying/componentMap";
import { HelpEmbed } from "../../../../lib/ui/embeds/HelpEmbed";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

export class Help extends NowPlayingConfigChildCommand {
  idSeed = "weeekly zoa";

  description = "View help about nowplaying config";
  usage = [""];

  slashCommand = true;

  async run() {
    const embed = new HelpEmbed()
      .setHeader("Help with nowplaying config")
      .setDescription(
        `
nowplaying config allows you to customize which elements appear in the footer of your nowplaying embeds!

**Use the following commands to set them:**
\`${this.prefix}npc view\` - View your current configuration
\`${this.prefix}npc set <options>\` - Set your configuration
\`${this.prefix}npc add <options>\` - Quickly add some options
\`${this.prefix}npc remove <options>\` - Quickly remove some options

You can also use \`${this.prefix}reacts\` to control nowplaying reactions.
You can change the username display and heart emoji in user settings. (\`${
          this.prefix
        }usersettings\`)

**Options**
${sortConfigOptions(getComponents().map((o) => o.componentName))
  .map((o) => code(o))
  .join(", ")}

**Presets**
In \`npc set\` you can use some presets, they are:
${this.getPresets()
  .map((d) => code(d))
  .join(", ")}
`
      )
      .setFooter(
        `Not sure what an option is? Try ${this.prefix}npc preview <option> to see what it might look like!`
      );

    await this.reply(embed);
  }
}
