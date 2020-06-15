import { LastFMErrorResponse } from "../services/LastFMService.types";

function parseErrorSix(message: string): string {
  if (message.includes("artist")) return "That artist could not be found";
  else if (message.includes("album")) return "That album could not be found";
  else return message;
}

export function parseError(error: LastFMErrorResponse): string {
  switch (error.error) {
    case 6:
      return parseErrorSix(error.message);

    default:
      return error.message;
  }
}
