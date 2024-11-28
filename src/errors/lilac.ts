import { ApolloError, ServerError } from "@apollo/client";
import { ErrorWithSupernovaID } from "../services/analytics/ErrorReportingService";
import { ClientError } from "./errors";

export function parseLilacError(error: Error): Error {
  if (error.message === "User is already being indexed or updated!") {
    return new AlreadyBeingUpdatedOrIndexedError();
  } else if (
    error instanceof ApolloError &&
    isServerError(error.networkError)
  ) {
    if (error?.networkError?.result?.supernova_id) {
      return new LilacError(
        error.message,
        error.networkError.result.supernova_id
      );
    }
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

export class LilacError extends Error implements ErrorWithSupernovaID {
  constructor(message: string, public readonly supernovaID: string) {
    super(message);
    this.name = "LilacError";
  }
}

export function isServerError(error: any | null): error is ServerError {
  return !!(error as ServerError)?.response;
}
