import { Command } from "../../../lib/command/Command";

export default class Restart extends Command {
  idSeed = "gfriend yerin";
  description = "Restart the bot";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  archived = true;

  async run() {}
}
