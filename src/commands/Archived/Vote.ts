import { Command } from "../../lib/command/Command";

export default class Vote extends Command {
  idSeed = "hot issue yebin";

  archived = true;

  subcategory = "about";
  description = "Vote for Gowon on top.gg!";
  aliases = ["topgg"];

  async run() {}
}
