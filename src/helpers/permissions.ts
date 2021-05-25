import { Message } from "discord.js";
import { Rollout } from "../lib/command/Command";

export function checkRollout(rollout: Rollout, message: Message): boolean {
  if (!rollout.users && !rollout.guilds) return true;

  if (rollout.users) {
    if (rollout.users.includes(message.author.id)) {
      return true;
    }
  } else if (rollout.guilds) {
    return rollout.guilds.includes(message.guild!.id);
  }

  return false;
}
