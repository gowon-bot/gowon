import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Prefix extends BaseCommand {
  idSeed = "apink hayoung";

  description = "Set or view the prefix";
  secretCommand = true;
  shouldBeIndexed = false;

  newPrefix?: string;

  setPrefix(prefix?: string): Prefix {
    this.newPrefix = prefix;
    return this;
  }

  async run() {
    if (this.newPrefix) {
      await this.gowonService.settingsManager.set(
        "prefix",
        this.scopes.guild,
        this.newPrefix
      );
      await this.traditionalReply(`the new prefix is ${this.prefix.code()}`);
    } else {
      await this.traditionalReply(`the prefix is ${this.prefix.code()}`);
    }
  }
}
