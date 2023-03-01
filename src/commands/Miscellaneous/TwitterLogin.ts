import { BetaAccess } from "../../lib/command/access/access";
import { Command } from "../../lib/command/Command";

export default class TwitterLogin extends Command {
  idSeed = "ive yujin";

  description = "Connect your Twitter account to Gowon";
  aliases = ["tlogin"];

  access = new BetaAccess();

  archived = true;

  async run() {}
}
