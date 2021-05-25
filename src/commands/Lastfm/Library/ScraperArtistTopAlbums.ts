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

export default class ScraperArtistTopAlbums extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "nature gaga";

  description = "Shows your top albums from an artist";
  aliases = ["satl", "satal"];
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

    let topAlbums = await this.lastFMService.scraper.artistTopAlbums(
      username,
      artist
    );

    let embed = this.newEmbed()
      .setAuthor(
        this.message.author.username,
        this.message.author.avatarURL() || ""
      )
      .setTitle(`Top ${artist} albums for ${username}`)
      .setURL(LinkGenerator.libraryArtistPage(username, artist))
      .setDescription(
        `_${displayNumber(topAlbums.total, `total scrobble`)}, ${displayNumber(
          topAlbums.count!,
          `total album`
        )}_\n\n` +
          topAlbums.items
            .map(
              (ta) =>
                `${displayNumber(ta.playcount, "play")} - ${ta.album.strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
