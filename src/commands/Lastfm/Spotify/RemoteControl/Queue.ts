import { Arguments } from "../../../../lib/arguments/arguments";
import { ConfirmationEmbed } from "../../../../lib/views/embeds/ConfirmationEmbed";
import { Requestable } from "../../../../services/LastFM/LastFMAPIService";
import { SpotifyTrack } from "../../../../services/Spotify/SpotifyService.types";
import { AuthenticatedSpotifyBaseCommand } from "../SpotifyBaseCommands";

const args = {
  inputs: {
    artist: { index: { start: 0 }, splitOn: "|" },
    track: { index: { start: 1 }, splitOn: "|" },
  },
} as const;

export default class Queue extends AuthenticatedSpotifyBaseCommand<
  typeof args
> {
  idSeed = "dreamnote lara";

  description = "Queues a song in Spotify";
  aliases = ["q"];

  arguments: Arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const handledReply = await this.handleRepliedMessage();

    if (!handledReply) {
      await this.handleMessageInput(senderRequestable);
    }
  }

  private async handleMessageInput(requestable: Requestable) {
    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      requestable
    );

    const spotifyTrack = (await this.spotifyService.searchTrack(
      this.ctx,
      artist,
      track
    ))!;

    if (
      !spotifyTrack.isExactMatch &&
      !(await this.confirmTrack(spotifyTrack))
    ) {
      return;
    }

    await this.spotifyService.queue(
      this.ctx,
      this.spotifyService.generateURI("track", spotifyTrack.id)
    );

    const embed = this.constructQueuedEmbed(
      spotifyTrack.artists[0].name,
      spotifyTrack.name,
      spotifyTrack.album.images[0].url
    );

    await this.send(embed);
  }

  private async handleRepliedMessage(): Promise<boolean> {
    const replied = await this.getRepliedMessage();

    if (!replied) return false;

    if (this.containsSpotifyLink(replied?.content)) {
      const uri = this.getSpotifyTrackURI(replied.content);
      const id = this.spotifyService.getIDFromURI(uri);

      const [track] = await Promise.all([
        await this.spotifyService.getTrack(this.ctx, id),
        await this.spotifyService.queue(this.ctx, uri),
      ]);

      const embed = this.constructQueuedEmbed(
        track.artists[0].name,
        track.name,
        track.album.images[0].url
      );

      await this.send(embed);
      return true;
    }
    return false;
  }

  private constructQueuedEmbed(
    artist: string,
    track: string,
    thumbnail: string
  ) {
    return this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Spotify queue song"))
      .setDescription(
        `Succesfully queued:
${track.italic()} by ${artist.strong()}!`
      )
      .setThumbnail(thumbnail);
  }

  private async confirmTrack(track: SpotifyTrack): Promise<boolean> {
    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Confirm track"))
      .setTitle("Couldn't find that exact track, did you mean:")
      .setDescription(
        `${track.name.italic()} by ${track.artists[0].name.strong()}?`
      )
      .setThumbnail(track.album.images[0].url);

    const confirmationEmbed = new ConfirmationEmbed(
      this.ctx,
      embed
    ).withRejectionReact();

    return await confirmationEmbed.awaitConfirmation();
  }
}
