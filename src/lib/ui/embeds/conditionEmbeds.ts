import { ClientError } from "../../../errors/errors";
import { uppercaseFirstLetter } from "../../../helpers/string";
import { Emoji } from "../../emoji/Emoji";
import { EmbedView } from "../views/EmbedView";
import { View } from "../views/View";

export const errorColour = "#F1759A";
export const warningColour = "#FCCA28";
export const infoColour = "#02BCA1";

enum ConditionEmbedType {
  Info = "info",
  Warning = "warning",
  Error = "error",
}

export class BaseConditionEmbed extends View {
  private type!: ConditionEmbedType;
  private message!: string;
  private footer?: string;

  constructor(private baseEmbed: EmbedView = new EmbedView()) {
    super();
  }

  asDiscordSendable(): EmbedView {
    return this.baseEmbed
      .setColour(
        this.type === ConditionEmbedType.Error
          ? errorColour
          : this.type === ConditionEmbedType.Info
          ? infoColour
          : this.type === ConditionEmbedType.Warning
          ? warningColour
          : "#000000"
      )
      .setHeader(uppercaseFirstLetter(this.type))
      .setDescription(
        `${
          this.type === ConditionEmbedType.Error
            ? Emoji.error
            : this.type === ConditionEmbedType.Info
            ? Emoji.info
            : this.type === ConditionEmbedType.Warning
            ? Emoji.warning
            : ""
        } ${uppercaseFirstLetter(this.message)}`
      )
      .setFooter(this.footer);
  }

  setType(type: ConditionEmbedType): this {
    this.type = type;
    return this;
  }

  setMessage(message: string): this {
    this.message = message;
    return this;
  }

  setFooter(footer?: string): this {
    this.footer = footer;
    return this;
  }
}

export class ErrorEmbed extends View {
  private error!: Error;

  constructor(private baseEmbed: EmbedView) {
    super();
  }

  asDiscordSendable(): EmbedView {
    const footer = this.error instanceof ClientError ? this.error.footer : "";
    const isWarning =
      this.error instanceof ClientError ? this.error.isWarning : false;

    return new BaseConditionEmbed(this.baseEmbed)
      .setType(
        isWarning ? ConditionEmbedType.Warning : ConditionEmbedType.Error
      )
      .setMessage(uppercaseFirstLetter(this.error.message))
      .setFooter(footer)
      .asDiscordSendable();
  }

  setError(error: Error): this {
    this.error = error;
    return this;
  }
}

export class InfoEmbed extends View {
  private message!: string;
  private footer?: string;

  constructor(private baseEmbed: EmbedView) {
    super();
  }

  asDiscordSendable(): EmbedView {
    return new BaseConditionEmbed(this.baseEmbed)
      .setType(ConditionEmbedType.Info)
      .setMessage(this.message)
      .setFooter(this.footer)
      .asDiscordSendable();
  }

  setMessage(message: string): this {
    this.message = message;
    return this;
  }
}
