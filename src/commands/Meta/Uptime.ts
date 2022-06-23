import { Command } from "../../lib/command/Command";

export default class Uptime extends Command {
  idSeed = "gfriend yuju";

  description = "Show's the bots uptime";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  archived = true;

  async run() {}
}
