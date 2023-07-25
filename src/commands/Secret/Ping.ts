import { Chance } from "chance";
import { shuffle } from "../../helpers/native/array";
import { Command } from "../../lib/command/Command";

export default class Ping extends Command {
  idSeed = "blackpink lisa";

  subcategory = "developer";
  description = "Ping! Pong! Pang?";
  aliases = ["🏓", "pin", "pingu", "pung", "peng", "핑", "pingmatrix", "bing"];

  secretCommand = true;
  slashCommand = true;

  async run() {
    if (this.extract.didMatch("pingmatrix")) {
      const matrix = [] as number[][];

      const rows = shuffle(["p", "n", "g", "o", "!"]);
      const columns = shuffle(["p", "n", "g", "o", "!"]);

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
          const column = columns[columnIndex];

          if (!matrix[rowIndex]) matrix[rowIndex] = [];

          matrix[rowIndex][columnIndex] = row === column ? 1 : 0;
        }
      }

      await this.send(`\`\`\`
    ${columns.join(" ")}
  / ${" ".repeat(columns.join(" ").length)} \\
${matrix
  .map((row, idx) => rows[idx] + " |" + " " + row.join(" ") + " |")
  .join("\n")}
  \\ ${" ".repeat(columns.join(" ").length)} /
\`\`\``);
    } else if (this.extract.didMatch("bing")) {
      await this.reply("Bong 🔔");
    } else if (this.extract.didMatch("pung")) {
      // PUNG! by Yukika
      await this.reply(
        "https://open.spotify.com/track/2YnPNuWGG3zlwyUyG0hBOd",
        { noUppercase: true }
      );
    } else if (this.extract.didMatch("peng")) {
      await this.reply("ting", { noUppercase: true });
    } else if (
      this.extract.didMatch("ping", "핑") &&
      Chance().bool({ likelihood: 20 })
    ) {
      await this.reply(this.extract.didMatch("핑") ? "팡! 🏌️" : "PANG! 🏌️");
    } else if (
      this.extract.didMatch("ping") &&
      Chance().bool({ likelihood: 1 })
    ) {
      await this.reply("PAPAOAONAGPNAGGGPNAGPANAGPANAGG");
    } else if (this.extract.didMatch("핑")) {
      await this.reply("퐁");
    } else {
      await this.reply(
        `Pon${
          this.extract.didMatch("pingu")
            ? "gu"
            : this.extract.didMatch("pin")
            ? ""
            : "g"
        } 🏓`,
        {
          ping: false,
        }
      );
    }
  }
}
