import { BaseValidator } from "./BaseValidator";

interface RangeValidatorOptions {
  min: number;
  max: number;
}

export class RangeValidator extends BaseValidator<RangeValidatorOptions> {
  validate(arg: number | undefined, argName: string) {
    if (!arg) return;

    if (arg > this.options.max || arg < this.options.min) {
      this.throw(
        `${argName} must be between ${this.options.min} and ${this.options.max}!`
      );
    }
  }
}
