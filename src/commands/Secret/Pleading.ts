import { Command } from "../../lib/command/Command";

export default class Pleading extends Command {
  idSeed = "2ne1 CL";

  subcategory = "fun";
  description = ":pleading:";
  aliases = ["🥺"];
  secretCommand = true;

  async run() {
    await this.send(`​   🥺\n👉👈`);
  }
}
