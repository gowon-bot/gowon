import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { AuthenticatedSpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class Like extends AuthenticatedSpotifyBaseCommand<typeof args> {
  idSeed = "pink fantasy daewang";

  description = "Adds a song to your Spotify Liked Songs";
  aliases = ["q"];

  arguments: Arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const track = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      throw new LogicError("Couldn't find a track to like!");
    }

    await this.spotifyService.saveTrackToLibrary(this.ctx, track.uri.asID);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Spotify like song"))
      .setDescription(
        `Succesfully liked:
${track.name.italic()} by ${track.artists.primary.name.strong()}!`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
