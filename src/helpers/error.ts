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
    
    case 17:
      return "That user's recent tracks are probably set to private. To turn off hidden recent tracks, visit your privacy settings in last.fm"

    default:
      return error.message;
  }
}
