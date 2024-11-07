import { ClientError } from "../../../errors/errors";
import { uppercaseFirstLetter } from "../../../helpers/string";
import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";
import { WarningEmbed } from "./WarningEmbed";

export const errorColour = "#F1759A";

export class ErrorEmbed extends EmbedView {
  error?: Error;
  errorCode?: string;

  asDiscordSendable(): EmbedView {
    const footer = this.error instanceof ClientError ? this.error.footer : "";
    const isWarning =
      this.error instanceof ClientError ? this.error.isWarning : false;

    const embed = super
      .asDiscordSendable()
      .setColour(errorColour)
      .setDescription(`${Emoji.error} ${this.description()}`);

    if (footer) {
      embed.setFooter(footer);
    } else if (this.errorCode) {
      embed.setFooter(`Error ID: ${this.errorCode}`);
    }

    return isWarning ? embed.convert(WarningEmbed) : embed;
  }

  setError(error: Error): this {
    this.error = error;
    return this;
  }

  setErrorCode(code: string | undefined): this {
    this.errorCode = code;
    return this;
  }

  protected description(): string | undefined {
    if (this.error) {
      return uppercaseFirstLetter(this.error.message);
    }

    return super.getDescription();
  }
}
