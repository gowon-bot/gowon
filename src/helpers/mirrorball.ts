import { fromUnixTime } from "date-fns";
import {
  MirrorballUser,
  UserInput,
} from "../services/mirrorball/MirrorballTypes";

export function convertMirrorballDate(date: number): Date {
  return fromUnixTime(date);
}

export function mirrorballUserToInput(user: MirrorballUser): UserInput {
  return { discordID: user.discordID };
}
