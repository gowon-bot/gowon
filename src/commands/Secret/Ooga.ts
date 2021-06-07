import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Ooga extends BaseCommand {
  idSeed = "blackpink rose";

  subcategory = "fun";
  description = "ooga";
  secretCommand = true;

  async run() {
    await this.send("booga");
  }
}
