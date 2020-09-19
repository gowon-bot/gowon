import { numberDisplay } from "../../../helpers";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

export interface RangeValidatorOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}

export class Range extends BaseValidator<RangeValidatorOptions> {
  validate(arg: number | undefined, argName: string) {
    if (!arg) return;

    if (
      (this.options.max && arg > this.options.max) ||
      (this.options.min && arg < this.options.min)
    ) {
      this.throw(
        this.options.min && this.options.max
          ? `${argName} must be between ${numberDisplay(
              this.options.min
            )} and ${numberDisplay(this.options.max)}!`
          : this.options.min
          ? `${argName} must be at least ${numberDisplay(this.options.min)}`
          : this.options.max
          ? `${argName} must be less than ${numberDisplay(this.options.max)}`
          : `please enter a valid ${argName}!`
      );
    }
  }
}
