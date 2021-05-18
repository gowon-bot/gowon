import { Arguments } from "../../../../lib/arguments/arguments";
import {
  componentMap,
  sortConfigOptions,
} from "../../../../lib/nowplaying/componentMap";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {},
} as const;

export class Help extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly zoa";

  description = "View help about nowplaying config";
  usage = [""];

  arguments: Arguments = args;

  async run() {
    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Config help")
    );

    embed
      .setDescription(
        `
nowplaying config allows you to customize which elements appear in the footer of your nowplaying embeds!

**Use the following commands to set them:**
\`${this.prefix}npc view\` - View your current configuration
\`${this.prefix}npc set <options>\` - Set your configuration
\`${this.prefix}npc add <options>\` - Quickly add some options
\`${this.prefix}npc remove <options>\` - Quickly remove some options

**Options**
${sortConfigOptions(Object.keys(componentMap))
  .map((o) => o.code())
  .join(", ")}

**Presets**
In \`npc set\` you can use some presets, they are:
${Object.keys(this.presets)
  .map((d) => d.code())
  .join(", ")}
`
      )
      .setFooter(
        `Not sure what an option is? Try ${this.prefix}npc preview <option> to see what it might look like!`
      );
    await this.send(embed);
  }
}
