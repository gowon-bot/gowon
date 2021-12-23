import { ConfirmationEmbed } from "../../lib/views/embeds/ConfirmationEmbed";
import { BaseService, BaseServiceContext } from "../BaseService";
import { Requestable } from "../LastFM/LastFMAPIService";
import {
  LastFMArguments,
  LastFMArgumentsMutableContext,
} from "../LastFM/LastFMArguments";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyURI } from "./converters/BaseConverter";
import { SpotifyTrack } from "./converters/Track";
import { SpotifyService } from "./SpotifyService";

interface GetTrackOptions {
  confirm: boolean;
}

type SpotifyArgumentsMutableContext = LastFMArgumentsMutableContext;

export class SpotifyArguments extends BaseService<
  BaseServiceContext & SpotifyArgumentsMutableContext
> {
  private readonly spotifyLinkRegex =
    /https:\/\/open\.spotify\.com\/track\/([\w]+)\/?/i;

  private get lastFMArguments() {
    return ServiceRegistry.get(LastFMArguments);
  }

  private get spotifyService() {
    return ServiceRegistry.get(SpotifyService);
  }

  async getTrack(
    ctx: BaseServiceContext & SpotifyArgumentsMutableContext,
    requestable: Requestable,
    options: Partial<GetTrackOptions> = {}
  ): Promise<SpotifyTrack | undefined> {
    const fromReplied = await this.getTrackFromReplied(ctx);

    if (fromReplied) return fromReplied;

    return this.getTrackFromMessageInput(ctx, requestable, options);
  }

  private async getTrackFromReplied(
    ctx: BaseServiceContext
  ): Promise<SpotifyTrack | undefined> {
    const replied = await ctx.command.getRepliedMessage();

    if (replied && this.containsSpotifyLink(replied.content)) {
      const uri = this.getSpotifyTrackURI(replied.content);

      return await this.spotifyService.getTrack(ctx, uri.asID);
    }

    return undefined;
  }

  private async getTrackFromMessageInput(
    ctx: BaseServiceContext & SpotifyArgumentsMutableContext,
    requestable: Requestable,
    options: Partial<GetTrackOptions>
  ) {
    const { artist, track } = await this.lastFMArguments.getTrack(
      ctx,
      requestable
    );

    const spotifyTrackSearch = await this.spotifyService.searchTrack(ctx, {
      artist,
      track,
    });

    const bestResult = spotifyTrackSearch.bestResult;

    if (!spotifyTrackSearch.hasAnyResults) return undefined;

    if (
      options.confirm &&
      !spotifyTrackSearch.bestResult.isExactMatch &&
      !(await this.confirmTrack(ctx, bestResult))
    ) {
      return undefined;
    }

    return spotifyTrackSearch.bestResult;
  }

  protected getSpotifyTrackURI(string: string): SpotifyURI<"track"> {
    const id = (string.match(this.spotifyLinkRegex) || [])[1];

    return this.spotifyService.generateURI("track", id);
  }

  protected containsSpotifyLink(string?: string): boolean {
    if (!string) return false;
    return this.spotifyLinkRegex.test(string);
  }

  private async confirmTrack(
    ctx: BaseServiceContext,
    track: SpotifyTrack
  ): Promise<boolean> {
    const embed = ctx.command
      .newEmbed()
      .setAuthor(...ctx.command.generateEmbedAuthor("Confirm track"))
      .setTitle("Couldn't find that exact track, did you mean:")
      .setDescription(
        `${track.name.italic()} by ${track.artists.primary.name.strong()}?`
      )
      .setThumbnail(track.album.images.largest.url);

    const confirmationEmbed = new ConfirmationEmbed(
      ctx,
      embed
    ).withRejectionReact();

    return await confirmationEmbed.awaitConfirmation();
  }
}
