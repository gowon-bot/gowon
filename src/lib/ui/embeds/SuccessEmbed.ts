import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";

export const successColour = "#02BCA1";

export class SuccessEmbed extends EmbedView {
  asDiscordSendable(): EmbedView {
    return super
      .asDiscordSendable()
      .setColour(successColour)
      .setDescription(`${Emoji.checkmark} ${this.getDescription()}`);
  }
}
