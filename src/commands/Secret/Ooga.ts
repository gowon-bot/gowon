import { Command } from "../../lib/command/Command";

export default class Ooga extends Command {
  idSeed = "blackpink rose";

  subcategory = "fun";
  description = "ooga";
  secretCommand = true;

  async run() {
    await this.reply("booga");
  }
}
