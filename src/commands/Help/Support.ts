import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Support extends BaseCommand {
  idSeed = "dreamnote sumin";

  subcategory = "about";
  description = "Links the Gowon support server";
  usage = [""];

  async run() {
    await this.send("https://discord.gg/9Vr7Df7TZf");
  }
}
