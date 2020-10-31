import { LastFMErrorResponse } from "../services/LastFM/LastFMService.types";

function parseErrorSix(message: string): string {
  console.log(message);
  if (message.toLowerCase().includes("artist"))
    return "that artist could not be found!";
  else if (message.toLowerCase().includes("album"))
    return "that album could not be found!";
  else if (message.toLowerCase().includes("user"))
    return "that user could not be found!";
  else return "that track could not be found!";
}

export function parseError(error: LastFMErrorResponse): string {
  switch (error.error) {
    case 6:
      return parseErrorSix(error.message);

    case 8:
      return "Last.fm is having issues at the moment, please try again in a few moments...";

    case 17:
      return "that user's recent tracks are probably set to private. To turn off hidden recent tracks, visit your privacy settings in last.fm";

    default:
      return error.message;
  }
}
