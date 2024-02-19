import { subsubheader } from "../../../helpers/discord";
import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";

export const helpColour = "#A6CE66";

export class HelpEmbed extends EmbedView {
  asDiscordSendable(): EmbedView {
    return super
      .asDiscordSendable()
      .setColour(helpColour)
      .setDescription(
        subsubheader(`${Emoji.help} ${this.properties.header}`, false) +
          (this.getDescription() ? "\n" + this.getDescription() : "")
      )
      .setHeader(undefined);
  }
}
