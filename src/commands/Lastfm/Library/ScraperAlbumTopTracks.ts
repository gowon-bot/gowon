import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

// Here for archival purposes
export default class ScraperAlbumTopTracks extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "nature sunshine";

  archived = true;

  description = "Shows your top tracks from an album";
  aliases = ["sltt"];
  usage = ["", "artist | album @user"];
  subcategory = "library";

  arguments: Arguments = args;

  async run() {}
}
