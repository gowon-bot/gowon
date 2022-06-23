import { ClientError } from "./errors";

export function parseLilacError(error: Error): Error {
  if (error.message === "User is already being indexed or updated!") {
    return new AlreadyBeingUpdatedOrIndexedError();
  }

  return error;
}

export class AlreadyBeingUpdatedOrIndexedError extends ClientError {
  constructor() {
    super(
      "You are already being updated or indexed! Please wait until you are done."
    );
  }
}
