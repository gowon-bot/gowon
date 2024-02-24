import { Command } from "../../lib/command/Command";

export default class Query extends Command {
  idSeed = "gfriend sowon";

  description = "Query the database";
  subcategory = "developer";
  devCommand = true;
  archived = true;

  async run() {}
}
