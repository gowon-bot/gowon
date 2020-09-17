import { ParsedArguments } from "../../arguments/arguments";
import { BaseValidator } from "./BaseValidator";

interface RequiredValidatorOptions {}

export class RequiredValidator extends BaseValidator<RequiredValidatorOptions> {
  validate(
    arg: number | undefined,
    argName: string,
    dependsOn?: ParsedArguments
  ) {
    if (dependsOn) {
      let valid = Object.values(dependsOn).reduce((acc, argValue) => {
        if (argValue) return acc;
      }, false);

      if (!valid) this.throw(`${argName} is required`);
    } else {
      if (!arg) this.throw(`${argName} is required!`);
    }
  }
}
