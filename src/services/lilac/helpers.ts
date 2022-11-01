import { User } from "../../database/entity/User";
import { LilacUserInput } from "./LilacAPIService.types";

export function userToUserInput(user: LilacUserInput | User): LilacUserInput {
  if (user instanceof User) {
    return { discordID: user.discordID };
  } else return user;
}

export const recommendUserToSetTimezone = (prefix: string) =>
  `Dates and times may not be accurate. See "${prefix}help tz" for more info on setting your timezone.`;
