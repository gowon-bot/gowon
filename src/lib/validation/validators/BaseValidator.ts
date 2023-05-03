import { ClientError } from "../../../errors/errors";
import { Validator } from "../ValidationChecker";

export interface ValidatorOptions {
  message?: string;
}

export class ArgumentValidationError extends ClientError {
  name = "ValidationError";
}

export abstract class BaseValidator<
  T extends ValidatorOptions = ValidatorOptions
> implements Validator
{
  constructor(protected options: T) {}

  protected throw(message: string) {
    throw new ArgumentValidationError(this.options.message || message);
  }

  abstract validate(arg: any | undefined, argName: string): void;
}
