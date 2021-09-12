import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ScraperArtistTopAlbums extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "nature gaga";

  archived = true;

  description = "Shows your top albums from an artist";
  aliases = ["satl", "satal"];
  usage = ["", "artist @user"];
  subcategory = "library";

  arguments: Arguments = args;

  async run() {}
}
