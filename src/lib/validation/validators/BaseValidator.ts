import { ClientError } from "../../../errors";
import { Validator } from "../ValidationChecker";

export interface ValidatorOptions {}

export class ValidationError extends ClientError {
  name = "ValidationError";
}

export abstract class BaseValidator<
  T extends ValidatorOptions = ValidatorOptions
> implements Validator {
  constructor(protected options: T) {}

  protected throw(message: string) {
    throw new ValidationError(message);
  }

  abstract validate(arg: any | undefined, argName: string): void;
}
