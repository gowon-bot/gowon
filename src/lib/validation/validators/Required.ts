import { ParsedArguments } from "../../arguments/arguments";
import { Logger } from "../../Logger";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

const vowels = "aeoi";

interface RequiredValidatorOptions extends ValidatorOptions {}

enum RequiredValidatorType {
  or = "or",
  and = "and",
}

export class Required extends BaseValidator<RequiredValidatorOptions> {
  type: RequiredValidatorType = RequiredValidatorType.or;

  validate(arg: any, argName: string, dependsOn?: ParsedArguments) {
    if (dependsOn) {
      let valid = [...Object.values(dependsOn), arg].reduce((acc, argValue) => {
        if (this.type === RequiredValidatorType.or && argValue) {
          acc = true;
        } else if (this.type === RequiredValidatorType.and && !argValue) {
          acc = false;
        }

        Logger.log("value", argValue);

        return acc;
      }, this.type === RequiredValidatorType.and);

      if (!valid)
        this.throw(
          `please specify a${
            vowels.includes(argName.charAt(0)) ? "n" : ""
          } ${argName}!`
        );
    } else {
      if (!arg)
        this.throw(
          `please specify a${
            vowels.includes(argName.charAt(0)) ? "n" : ""
          } ${argName}!`
        );
    }
  }
}

export class RequiredOr extends Required {
  type = RequiredValidatorType.or;
}

export class RequiredAnd extends Required {
  type = RequiredValidatorType.and;
}
