import { Command } from "../../lib/command/Command";

export default class Eval extends Command {
  idSeed = "redsquare ari";

  subcategory = "developer";
  description = "Not for you to run >:(";
  devCommand = true;
  archived = true;

  async run() {}
}
