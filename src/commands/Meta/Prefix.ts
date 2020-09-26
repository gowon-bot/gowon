import { Message } from "discord.js";
import { RunAs } from "../../lib/AliasChecker";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Prefix extends BaseCommand {
  description = "Set the prefix";
  secretCommand = true;
  shouldBeIndexed = false;

  prefix?: string;

  setPrefix(prefix?: string): Prefix {
    this.prefix = prefix;
    return this;
  }

  async run(_: Message, __: RunAs) {
    if (this.prefix) {
      await this.gowonService.setPrefix(this.guild.id, this.prefix);
      await this.reply(`The new prefix is ${this.prefix.code()}`);
    } else {
      this.prefix = await this.gowonService.prefix(this.guild.id);
      await this.reply(`The prefix is ${this.prefix.code()}`);
    }
  }
}
