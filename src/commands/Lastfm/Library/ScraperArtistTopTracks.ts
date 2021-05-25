import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LinkGenerator } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

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

  description = "Shows your top tracks from an artist";
  aliases = ["satt"];
  usage = ["", "artist @user"];
  subcategory = "library";

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { username, senderUsername } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(senderUsername)).artist;
    } else {
      artist = await this.lastFMService.correctArtist({ artist });
    }

    let topTracks = await this.lastFMService.scraper.artistTopTracks(
      username,
      artist
    );

    let embed = this.newEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || ""
      )
      .setTitle(`Top ${artist.strong()} tracks for ${username}`)
      .setURL(LinkGenerator.libraryArtistPage(username, artist))
      .setDescription(
        `_${displayNumber(topTracks.total, "total scrobble")}, ${displayNumber(
          topTracks.count!,
          `total track`
        )}_\n\n` +
          topTracks.items
            .map(
              (tt) =>
                `${displayNumber(tt.playcount, "play")} - ${tt.track.strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
