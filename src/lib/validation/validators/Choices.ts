import { BaseValidator, ValidatorOptions } from "./BaseValidator";

export interface ChoicesValidatorOptions<T> extends ValidatorOptions {
  choices: T[];
}

export class Choices<T> extends BaseValidator<ChoicesValidatorOptions<T>> {
  validate(arg: any | undefined, argName: string) {
    if (arg === undefined) return;

    if (!this.options.choices.includes(arg)) {
      this.throw(
        `${argName} must be one of the following: ${this.options.choices
          .map((c) => (typeof c === "string" ? c.code() : c))
          .join(", ")}`
      );
    }
  }
}
