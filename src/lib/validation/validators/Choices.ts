import { code } from "../../../helpers/discord";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

export interface ChoicesValidatorOptions<T> extends ValidatorOptions {
  choices: T[];
  ignoreCase?: boolean;
}

export class Choices<T> extends BaseValidator<ChoicesValidatorOptions<T>> {
  validate(arg: any | undefined, argName: string) {
    if (arg === undefined) return;

    if (!this.includesChoice(arg)) {
      this.throw(
        `${argName} must be one of the following: ${this.options.choices
          .map((c) => (typeof c === "string" ? code(c) : c))
          .join(", ")}`
      );
    }
  }

  private includesChoice(arg: string): boolean {
    const choices = this.options.ignoreCase
      ? this.options.choices.map((c) =>
          typeof c === "string" ? c.toLowerCase() : c
        )
      : this.options.choices;

    return choices.includes(this.options.ignoreCase ? arg.toLowerCase() : arg);
  }
}
