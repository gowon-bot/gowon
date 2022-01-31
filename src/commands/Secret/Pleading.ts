import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Pleading extends BaseCommand {
  idSeed = "2ne1 CL";

  subcategory = "fun";
  description = ":pleading:";
  aliases = ["🥺"];
  secretCommand = true;

  async run() {
    await this.send(`​   🥺\n👉👈`);
  }
}
