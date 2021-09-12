import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ScraperArtistTopTracks extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "gwsn anne";

  archived = true;

  description = "Shows your top tracks from an artist";
  aliases = ["satt"];
  usage = ["", "artist @user"];
  subcategory = "library";

  arguments: Arguments = args;

  async run() {}
}
