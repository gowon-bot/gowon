import { Rollout } from "../lib/command/Rollout";
import { Payload } from "../lib/context/Payload";

export function checkRollout(rollout: Rollout, payload: Payload): boolean {
  if (!rollout.users && !rollout.guilds) return true;

  if (rollout.users) {
    if (rollout.users.includes(payload.author.id)) {
      return true;
    }
  } else if (rollout.guilds) {
    return payload.guild ? rollout.guilds.includes(payload.guild.id) : false;
  }

  return false;
}
