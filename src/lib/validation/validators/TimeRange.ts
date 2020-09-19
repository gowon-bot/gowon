import { BaseValidator, ValidatorOptions } from "./BaseValidator";
import { TimeRange as TimeRangeType } from "../../../helpers/date";

interface TimeRangeValidatorOptions extends ValidatorOptions {
  requireFrom?: boolean;
  requireTo?: boolean;
}

export class TimeRange extends BaseValidator<TimeRangeValidatorOptions> {
  validate(arg: TimeRangeType | undefined, argName: string) {
    if (!arg) return;

    if (
      (this.options.requireFrom && !arg.from) ||
      (this.options.requireFrom && !arg.to)
    ) {
      this.throw(`please enter a valid ${argName}!`);
    }
  }
}
