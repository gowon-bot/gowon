import { Command } from "../../lib/command/Command";

export default class ID extends Command {
  idSeed = "exid hyerin";

  subcategory = "developer";
  description = "Show your, or another person's discord ID";
  usage = ["", "discord username"];

  archived = true;

  async run() {}
}
