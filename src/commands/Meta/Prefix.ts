import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Prefix extends BaseCommand {
  idSeed = "apink hayoung";

  description = "Set or view the prefix";
  secretCommand = true;
  shouldBeIndexed = false;

  prefix?: string;

  setPrefix(prefix?: string): Prefix {
    this.prefix = prefix;
    return this;
  }

  async run() {
    if (this.prefix) {
      await this.gowonService.setPrefix(this.guild.id, this.prefix);
      await this.reply(`the new prefix is ${this.prefix.code()}`);
    } else {
      this.prefix = await this.gowonService.prefix(this.guild.id);
      await this.reply(`the prefix is ${this.prefix.code()}`);
    }
  }
}
