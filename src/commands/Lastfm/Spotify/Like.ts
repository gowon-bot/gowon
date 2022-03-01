import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { AuthenticatedSpotifyBaseCommand } from "./SpotifyBaseCommands";

const args = {
  ...prefabArguments.track,
} as const;

export default class Like extends AuthenticatedSpotifyBaseCommand<typeof args> {
  idSeed = "pink fantasy daewang";

  description = "Adds a song to your Spotify liked songs";
  aliases = ["q"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "unlike",
      description: "Removes a song from your Spotify liked songs",
      variation: ["unlike"],
    },
  ];

  arguments = args;

  async run() {
    const unlike = this.variationWasUsed("unlike");

    const { senderRequestable, dbUser } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    this.access.checkAndThrow(dbUser);

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
