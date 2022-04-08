import { CardsChildCommand } from "./CardsChildCommand";

export class View extends CardsChildCommand {
  idSeed = "kep1er yujin";

  description = "Views one of your cards";
  subcategory = "library stats";
  aliases = ["card"];
  archived = true;

  async run() {}
}
