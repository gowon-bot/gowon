import specialUsers from "../lib/specialUsers.json";
import { flatDeep } from "./native/array";

export type BotName =
  | "rem"
  | "gowon"
  | "gowon development"
  | "chuu"
  | "fmbot"
  | "fmbot develop"
  | "who knows"
  | "miso";

export function isGowon(userID?: string) {
  return isBot(userID, "gowon") || isBot(userID, "gowon development");
}

export function isBot(
  userID: string | undefined,
  botName: BotName | BotName[]
) {
  const botNames = flatDeep([botName]);

  return specialUsers.bots.some(
    (bot) => botNames.includes(bot.name) && bot.id === userID
  );
}
