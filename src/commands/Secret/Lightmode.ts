import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Lightmode extends BaseCommand {
  idSeed = "blackpink jennie";

  subcategory = "fun";
  aliases = [
    "mexhastoexplainhowlightmodeisanaccessibilityissueforthehundredthtimeinarowbecauseredditlikestohateonrandomthingsthatpeopleenjoyfornoreason",
  ];
  description = "-_-";
  secretCommand = true;

  async run() {
    if (this.author.id === "196249128286552064")
      await this.sendWithFiles("*sigh*", [
        "https://media.discordapp.net/attachments/743258490553761913/752764405049065552/unknown.png",
      ]);
  }
}
