import { displayNumber } from "../../ui/displays";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

export interface LengthRangeValidatorOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}

export class LengthRangeValidator extends BaseValidator<LengthRangeValidatorOptions> {
  validate(arg: { length: number } | undefined, argName: string) {
    if (arg === undefined) return;

    if (
      (this.options.max !== undefined && arg.length > this.options.max) ||
      (this.options.min !== undefined && arg.length < this.options.min)
    ) {
      this.throw(
        this.options.min && this.options.max
          ? `please specify between ${displayNumber(
              this.options.min
            )} and ${displayNumber(this.options.max)} ${argName}!`
          : this.options.min
          ? `please specify at least ${displayNumber(
              this.options.min
            )} ${argName}!`
          : this.options.max
          ? `please specify at most ${displayNumber(
              this.options.max
            )} ${argName}!`
          : `please enter a valid ${argName}!`
      );
    }
  }
}
