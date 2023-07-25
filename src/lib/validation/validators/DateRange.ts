import { DateRange } from "../../timeAndDate/DateRange";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

interface DateRangeValidatorOptions extends ValidatorOptions {
  requireFrom?: boolean;
  requireTo?: boolean;
  treatOnlyToAsEmpty?: boolean;
}

export class DateRangeValidator extends BaseValidator<DateRangeValidatorOptions> {
  validate(arg: DateRange | undefined, argName: string) {
    if (!arg || (this.options.treatOnlyToAsEmpty && !arg.from)) return;

    if (
      (this.options.requireFrom && !arg.from) ||
      (this.options.requireFrom && !arg.to)
    ) {
      this.throw(`please enter a valid ${argName}!`);
    }
  }
}
