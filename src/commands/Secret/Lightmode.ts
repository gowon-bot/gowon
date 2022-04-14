import { Command } from "../../lib/command/Command";

export default class Lightmode extends Command {
  idSeed = "blackpink jennie";

  subcategory = "fun";
  aliases = [
    "mexhastoexplainhowlightmodeisanaccessibilityissueforthehundredthtimeinarowbecauseredditlikestohateonrandomthingsthatpeopleenjoyfornoreason",
  ];
  description = "-_-";
  secretCommand = true;

  async run() {
    if (this.author.id === "196249128286552064")
      await this.send("*sigh*", {
        files: [
          "https://media.discordapp.net/attachments/743258490553761913/752764405049065552/unknown.png",
        ],
      });
  }
}
