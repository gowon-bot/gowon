import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { Variation } from "../../../lib/command/BaseCommand";
import { AuthenticatedSpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class Like extends AuthenticatedSpotifyBaseCommand<typeof args> {
  idSeed = "pink fantasy daewang";

  description = "Adds a song to your Spotify liked songs";
  aliases = ["q"];

  variations: Variation[] = [
    {
      name: "unlike",
      description: "Removes a song from your Spotify liked songs",
      variation: ["unlike"],
    },
  ];

  arguments: Arguments = args;

  async run() {
    const unlike = this.variationWasUsed("unlike");

    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const track = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      throw new LogicError(
        `Couldn't find a track to ${unlike ? "un" : ""}like!`
      );
    }

    if (unlike) {
      await this.spotifyService.removeTrackFromLibrary(
        this.ctx,
        track.uri.asID
      );
    } else {
      await this.spotifyService.saveTrackToLibrary(this.ctx, track.uri.asID);
    }

    const embed = this.newEmbed()
      .setAuthor(
        this.generateEmbedAuthor(`Spotify ${unlike ? "un" : ""}like song`)
      )
      .setDescription(
        `Succesfully ${unlike ? "un" : ""}liked:
${track.name.italic()} by ${track.artists.primary.name.strong()}!`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
