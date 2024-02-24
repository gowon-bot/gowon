import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";

export const warningColour = "#FCCA28";

export class WarningEmbed extends EmbedView {
  asDiscordSendable(): EmbedView {
    return super
      .asDiscordSendable()
      .setColour(warningColour)
      .setDescription(`${Emoji.warning} ${this.getDescription()}`);
  }
}
