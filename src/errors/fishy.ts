import { Chance } from "chance";
import { FishyProfile } from "../database/entity/fishy/FishyProfile";
import { bold, code } from "../helpers/discord";
import { emDash, quote } from "../helpers/specialCharacters";
import { ClientError } from "./errors";

export class FishyNotFoundError extends ClientError {
  name = "FishyNotFoundError";

  constructor(name?: string) {
    super(
      `Couldn't find a fishy with ${
        name ? `the name ${code(name)}` : "that name"
      }!`
    );
  }
}

const misoCooldownQuotes: Array<(time: string) => string> = [
  (t) => `Bro chill, you can't fish yet! Please wait ${t}`,
  (t) => `You can't fish yet, fool! Please wait ${t}`,
  (t) => `You're fishing too fast! Please wait ${t}`,
  (t) => `You're still on cooldown buddy. Please wait ${t}`,
];

const cooldownMessages: Array<(time: string) => string> = [
  ...misoCooldownQuotes.map(
    (m) => (t: string) => `${quote(m(t))}\n${emDash} Miso bot`
  ),
  (t) => `You can't fish for another ${t}.`,
  (t) => `There's no fish around, try waiting another ${t}.`,
  (t) => `Nothing bit, try waiting another ${t}.`,
  (t) => `You can't fish for another ${t}.`,
];

export class CantFishYetError extends ClientError {
  name = "CantFishYetError";

  constructor(fishyProfile: FishyProfile) {
    const time = bold(fishyProfile.getCooldownTime());

    super(Chance().pickone(cooldownMessages)(time));
  }
}
