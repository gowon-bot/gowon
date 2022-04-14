import { Command } from "../../lib/command/Command";

export default class Support extends Command {
  idSeed = "dreamnote sumin";

  subcategory = "about";
  description = "Links the Gowon support server";
  usage = [""];

  async run() {
    await this.send("https://discord.gg/9Vr7Df7TZf");
  }
}
