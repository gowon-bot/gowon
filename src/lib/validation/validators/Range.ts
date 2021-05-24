import { displayNumber } from "../../views/displays";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

export interface RangeValidatorOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}

export class Range extends BaseValidator<RangeValidatorOptions> {
  validate(arg: number | undefined, argName: string) {
    if (arg === undefined) return;

    if (
      (this.options.max !== undefined && arg > this.options.max) ||
      (this.options.min !== undefined && arg < this.options.min)
    ) {
      this.throw(
        this.options.min && this.options.max
          ? `${argName} must be between ${displayNumber(
              this.options.min
            )} and ${displayNumber(this.options.max)}!`
          : this.options.min
          ? `${argName} must be at least ${displayNumber(this.options.min)}`
          : this.options.max
          ? `${argName} must be less than ${displayNumber(this.options.max)}`
          : `please enter a valid ${argName}!`
      );
    }
  }
}
