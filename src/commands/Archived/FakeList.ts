import { Command } from "../../lib/command/Command";

export default class List extends Command {
  idSeed = "stayc sieun";

  aliases = ["l"];
  description = "This is a temporary command <3";
  secretCommand = true;
  archived = true;

  async run() {}
}
