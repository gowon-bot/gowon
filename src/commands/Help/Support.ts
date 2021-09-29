import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";

const args = {} as const;

export default class Support extends BaseCommand<typeof args> {
  idSeed = "dreamnote sumin";

  subcategory = "about";
  description = "Links the Gowon support server";
  usage = [""];

  arguments: Arguments = args;

  async run() {
    await this.send("https://discord.gg/9Vr7Df7TZf");
  }
}
