import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";

const infoColour = "#4BD2FD";

export class InfoEmbed extends EmbedView {
  asDiscordSendable(): EmbedView {
    return super
      .asDiscordSendable()
      .setColour(infoColour)
      .setDescription(`${Emoji.info} ${this.getDescription()}`);
  }
}
