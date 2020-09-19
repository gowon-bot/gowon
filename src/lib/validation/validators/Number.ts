import { BaseValidator, ValidatorOptions } from "./BaseValidator";

interface NumberValidatorOptions extends ValidatorOptions {
  whole?: boolean;
}

export class Number extends BaseValidator<NumberValidatorOptions> {
  validate(arg: number | undefined, argName: string) {
    if (!arg) return;

    if (isNaN(arg) || (this.options.whole && arg < 0)) {
      this.throw(`please enter a valid ${argName}!`);
    }
  }
}
