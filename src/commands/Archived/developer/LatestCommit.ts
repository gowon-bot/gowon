import { Command } from "../../../lib/command/Command";

export default class LatestCommit extends Command {
  idSeed = "apink naeun";

  aliases = ["whatsnew"];
  subcategory = "developer";
  secretCommand = true;
  description = "Displays the most recent commit to the Gowon repository";

  archived = true;

  async run() {}
}
