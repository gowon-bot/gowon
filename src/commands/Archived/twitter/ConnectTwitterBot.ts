import { Command } from "../../../lib/command/Command";

export default class ConnectTwitterBot extends Command {
  idSeed = "ive gaeul";

  description = "Connect the Twitter bot to the Discord one";
  subcategory = "developer";

  secretCommand = true;
  devCommand = true;
  archived = true;

  async run() {}
}
