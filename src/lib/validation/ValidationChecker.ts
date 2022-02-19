import { SimpleMap } from "../../helpers/types";

export interface Validator {
  validate(arg: any | undefined, argName: string, dependsOn?: SimpleMap): void;
}

type ValidatorOptions =
  | Validator
  | { validator: Validator; dependsOn?: string[]; friendlyName?: string };

export type Validation = SimpleMap<Array<ValidatorOptions> | ValidatorOptions>;

function isValidator(validator: ValidatorOptions): validator is Validator {
  return (validator as Validator).validate !== undefined;
}

export class ValidationChecker {
  constructor(private args: SimpleMap, private validation: Validation) {}

  runValidator(
    validator: ValidatorOptions,
    argumentName: string,
    argumentValue: any
  ): void {
    if (isValidator(validator)) {
      validator.validate(argumentValue, argumentName);
    } else {
      let dependsOn = (validator?.dependsOn || []).reduce((acc, arg) => {
        acc[arg] = this.args[arg];

        return acc;
      }, {} as SimpleMap);

      validator.validator.validate(
        argumentValue,
        validator.friendlyName || argumentName,
        dependsOn
      );
    }
  }

  validate() {
    let argumentEntries = Object.entries(this.args);

    for (let [argumentName, argumentValue] of argumentEntries) {
      let argumentValidators = this.validation[argumentName];

      if (!argumentValidators) continue;

      let validators =
        argumentValidators instanceof Array
          ? argumentValidators
          : [argumentValidators];

      for (let validator of validators) {
        this.runValidator(validator, argumentName, argumentValue);
      }
    }
  }
}
