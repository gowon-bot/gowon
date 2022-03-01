import { Chance } from "chance";
import { shuffle } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ping extends BaseCommand {
  idSeed = "blackpink lisa";

  subcategory = "developer";
  description = "Ping! Pong! Pang?";
  aliases = ["🏓", "pin", "pingu", "pung", "peng", "핑", "pingmatrix", "bing"];
  secretCommand = true;
  slashCommand = true;

  async run() {
    if (this.runAs.variationWasUsed("pingmatrix")) {
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
    } else if (this.runAs.variationWasUsed("bing")) {
      await this.reply("Bong 🔔");
    } else if (this.runAs.variationWasUsed("pung")) {
      // PUNG! by Yukika
      await this.reply(
        "https://open.spotify.com/track/2YnPNuWGG3zlwyUyG0hBOd",
        { noUppercase: true }
      );
    } else if (this.runAs.variationWasUsed("peng")) {
      await this.reply("ting", { noUppercase: true });
    } else if (
      this.runAs.variationWasUsed("ping", "핑") &&
      Chance().bool({ likelihood: 20 })
    ) {
      await this.reply(
        this.runAs.variationWasUsed("핑") ? "팡! 🏌️" : "PANG! 🏌️"
      );
    } else if (
      this.runAs.variationWasUsed("ping") &&
      Chance().bool({ likelihood: 1 })
    ) {
      await this.reply("PAPAOAONAGPNAGGGPNAGPANAGPANAGG");
    } else if (this.runAs.variationWasUsed("핑")) {
      await this.reply("퐁");
    } else {
      await this.reply(
        `Pon${
          this.runAs.variationWasUsed("pingu")
            ? "gu"
            : this.runAs.variationWasUsed("pin")
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
