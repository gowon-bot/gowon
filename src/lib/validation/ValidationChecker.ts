import { ParsedArguments } from "../arguments/arguments";

export interface Validator {
  validate(
    arg: any | undefined,
    argName: string,
    dependsOn?: ParsedArguments
  ): void;
}

export interface Validation {
  [key: string]: Validator[] | { validators: Validator[]; dependsOn: string[] };
}

export class ValidationChecker {
  constructor(private args: ParsedArguments, private validation: Validation) {}

  validate() {
    let argumentEntries = Object.entries(this.args);

    for (let [argumentName, argumentValue] of argumentEntries) {
      let validators = this.validation[argumentName];

      if (!validators) continue;

      if (validators instanceof Array) {
        validators.forEach((v) => v.validate(argumentValue, argumentName));
      } else {
        let dependsOn = validators.dependsOn;
        validators.validators.forEach((v) =>
          v.validate(
            argumentValue,
            argumentName,
            dependsOn.reduce((acc, arg) => {
              acc[arg] = this.args[arg];

              return acc;
            }, {} as ParsedArguments)
          )
        );
      }
    }
  }
}
