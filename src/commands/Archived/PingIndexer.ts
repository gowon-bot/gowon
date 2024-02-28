import { Command } from "../../lib/command/Command";

export default class PingMirrorball extends Command {
  idSeed = "exid jeonghwa";
  aliases = ["pingindexer"];
  archived = true;

  description = "Ping Mirrorball";
  subcategory = "developer";
  secretCommand = true;

  async run() {}
}
