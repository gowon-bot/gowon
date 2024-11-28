import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";

export const successColour = "#02BCA1";

export class SuccessEmbed extends EmbedView {
  private successEmoji: string = Emoji.checkmark;

  public asDiscordSendable(): EmbedView {
    return super
      .asDiscordSendable()
      .setColour(successColour)
      .setDescription(`${this.successEmoji} ${this.getDescription()}`);
  }

  public setSuccessEmoji(emoji: string): this {
    this.successEmoji = emoji;
    return this;
  }
}
