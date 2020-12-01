import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LinkGenerator } from "../../../helpers/lastFM";

export default class ArtistTopTracks extends LastFMBaseCommand {
  description = "Shows your top tracks from an artist";
  aliases = ["att"];
  usage = ["", "artist @user"];
  subcategory = "library";

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
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
        `_${numberDisplay(topTracks.total, "total scrobble")}, ${numberDisplay(
          topTracks.count!,
          `total track`
        )}_\n\n` +
          topTracks.items
            .map(
              (tt) =>
                `${numberDisplay(tt.playcount, "play")} - ${tt.track.strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
