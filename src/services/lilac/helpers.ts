import { User } from "../../database/entity/User";
import { LilacUserInput } from "./LilacAPIService.types";

export function userToUserInput(user: LilacUserInput | User): LilacUserInput {
  if (user instanceof User) {
    return { discordID: user.discordID };
  } else return user;
}
