import { SimpleMap } from "../../../helpers/types";
import { BaseValidator, ValidatorOptions } from "./BaseValidator";

const vowels = "aeoi";

interface RequiredValidatorOptions extends ValidatorOptions {}

enum RequiredValidatorType {
  or = "or",
  and = "and",
}

export class RequiredValidator extends BaseValidator<RequiredValidatorOptions> {
  type: RequiredValidatorType = RequiredValidatorType.or;

  validate(arg: any, argName: string, dependsOn?: SimpleMap) {
    if (dependsOn) {
      let valid = [...Object.values(dependsOn), arg].reduce((acc, argValue) => {
        if (this.type === RequiredValidatorType.or && argValue) {
          acc = true;
        } else if (this.type === RequiredValidatorType.and && !argValue) {
          acc = false;
        }

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

export class RequiredOrValidator extends RequiredValidator {
  type = RequiredValidatorType.or;
}

export class RequiredAndValidator extends RequiredValidator {
  type = RequiredValidatorType.and;
}
