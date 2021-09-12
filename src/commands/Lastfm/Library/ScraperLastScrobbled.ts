import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class ScraperLastScrobbled extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "gwsn lena";

  archived = true;

  description = "Shows the last time you scrobbled a song";
  aliases = ["slast"];
  usage = ["", "artist | track @user"];
  subcategory = "library";

  arguments: Arguments = args;

  async run() {}
}
