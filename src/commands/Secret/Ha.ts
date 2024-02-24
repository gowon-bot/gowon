import { Command } from "../../lib/command/Command";

export default class Ha extends Command {
  idSeed = "gfriend umji";

  subcategory = "fun";
  aliases = ["hah"];
  description = "Hah!";
  secretCommand = true;

  async run() {
    await this.reply("Hah! https://www.youtube.com/watch?v=3ec6jOMDCXI");
  }
}
