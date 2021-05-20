import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LinkGenerator } from "../../../helpers/lastFM";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ArtistTopAlbums extends LastFMBaseCommand<typeof args> {
  idSeed = "nature gaga";

  description = "Shows your top albums from an artist";
  aliases = ["atl", "atal"];
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
        `_${numberDisplay(topAlbums.total, `total scrobble`)}, ${numberDisplay(
          topAlbums.count!,
          `total album`
        )}_\n\n` +
          topAlbums.items
            .map(
              (ta) =>
                `${numberDisplay(ta.playcount, "play")} - ${ta.album.strong()}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
