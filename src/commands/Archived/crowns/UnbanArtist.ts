import { CrownsChildCommand } from "../../Lastfm/Crowns/CrownsChildCommand";

export class UnbanArtist extends CrownsChildCommand {
  idSeed = "elris sohee";

  description = "Unbans an artist from the crowns game";
  usage = "artist";

  archived = true;

  async run() {}
}
