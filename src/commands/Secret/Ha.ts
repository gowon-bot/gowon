import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ha extends BaseCommand {
  idSeed = "gfriend umji";

  subcategory = "fun";
  aliases = ["hah"];
  description = "Hah!";
  secretCommand = true;

  async run() {
    await this.send("Hah! https://www.youtube.com/watch?v=3ec6jOMDCXI");
  }
}
