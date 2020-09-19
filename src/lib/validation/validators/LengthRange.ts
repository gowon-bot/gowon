import { BaseValidator, ValidatorOptions } from "./BaseValidator";

interface LengthRangeValidatorOptions extends ValidatorOptions {
  min: number;
  max: number;
}

export class LengthRange extends BaseValidator<
  LengthRangeValidatorOptions
> {
  validate(arg: { length: number } | undefined, argName: string) {
    if (!arg) return;

    if (arg.length > this.options.max || arg.length < this.options.min) {
      this.throw(
        `please specify between ${this.options.min} and ${this.options.max} ${argName}!`
      );
    }
  }
}
