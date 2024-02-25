import { Message } from "discord.js";
import { bold, italic } from "../../helpers/discord";
import { GowonContext } from "../../lib/context/Context";
import { ConfirmationView } from "../../lib/ui/views/ConfirmationView";
import { BaseService } from "../BaseService";
import { Requestable } from "../LastFM/LastFMAPIService";
import {
  LastFMArguments,
  LastFMArgumentsMutableContext,
} from "../LastFM/LastFMArguments";
import { ServiceRegistry } from "../ServicesRegistry";
import { SpotifyService } from "./SpotifyService";
import { SpotifyAlbum } from "./converters/Album";
import { SpotifyArtist } from "./converters/Artist";
import { SpotifyToken } from "./converters/Auth";
import { SpotifyURI } from "./converters/BaseConverter";
import { SpotifyTrack } from "./converters/Track";

interface GetTrackOptions {
  confirm: boolean;
}

type SpotifyArgumentsContext = GowonContext<{
  mutable?: LastFMArgumentsMutableContext & { spotifyToken?: SpotifyToken };
}>;

export class SpotifyArguments extends BaseService<SpotifyArgumentsContext> {
  private readonly trackLinkRegex =
    /https:\/\/open\.spotify\.com\/track\/([\w]+)\/?/i;
  private readonly artistLinkRegex =
    /https:\/\/open\.spotify\.com\/artist\/([\w]+)\/?/i;
  private readonly albumLinkRegex =
    /https:\/\/open\.spotify\.com\/album\/([\w]+)\/?/i;

  private get lastFMArguments() {
    return ServiceRegistry.get(LastFMArguments);
  }

  private get spotifyService() {
    return ServiceRegistry.get(SpotifyService);
  }

  async getTrack(
    ctx: SpotifyArgumentsContext,
    requestable: Requestable,
    options: Partial<GetTrackOptions> = {}
  ): Promise<{ track?: SpotifyTrack; askedConfirmation?: boolean }> {
    const fromReplied = await this.getTrackFromReplied(ctx);

    if (fromReplied) return { track: fromReplied };

    return this.getTrackFromMessageInput(ctx, requestable, options);
  }

  public async getTrackFromReplied(
    ctx: SpotifyArgumentsContext,
    repliedMessage?: Message
  ): Promise<SpotifyTrack | undefined> {
    const replied = repliedMessage || (await ctx.getRepliedMessage());

    if (replied && this.containsLink(replied.content, this.trackLinkRegex)) {
      const uri = this.getSpotifyTrackURI(replied.content);

      return await this.spotifyService.getTrack(ctx, uri.asID);
    }

    return undefined;
  }

  public async getAlbumFromReplied(
    ctx: SpotifyArgumentsContext,
    repliedMessage?: Message
  ): Promise<SpotifyAlbum | undefined> {
    const replied = repliedMessage || (await ctx.getRepliedMessage());

    if (replied && this.containsLink(replied.content, this.albumLinkRegex)) {
      const uri = this.getSpotifyAlbumURI(replied.content);

      return await this.spotifyService.getAlbum(ctx, uri.asID);
    }

    return undefined;
  }

  public async getArtistFromReplied(
    ctx: SpotifyArgumentsContext,
    repliedMessage?: Message
  ): Promise<SpotifyArtist | undefined> {
    const replied = repliedMessage || (await ctx.getRepliedMessage());

    if (replied && this.containsLink(replied.content, this.artistLinkRegex)) {
      const uri = this.getSpotifyArtistURI(replied.content);

      return await this.spotifyService.getArtist(ctx, uri.asID);
    }

    return undefined;
  }

  private async getTrackFromMessageInput(
    ctx: SpotifyArgumentsContext,
    requestable: Requestable,
    options: Partial<GetTrackOptions>
  ): Promise<{ track?: SpotifyTrack; askedConfirmation?: boolean }> {
    const { artist, track } = await this.lastFMArguments.getTrack(
      ctx,
      requestable
    );

    const spotifyTrackSearch = await this.spotifyService.searchTrack(ctx, {
      artist,
      track,
    });

    const bestResult = spotifyTrackSearch.bestResult;

    if (!spotifyTrackSearch.hasAnyResults) return {};

    if (
      options.confirm &&
      !spotifyTrackSearch.bestResult.isExactMatch &&
      !(await this.confirmTrack(ctx, bestResult))
    ) {
      return { askedConfirmation: true };
    }

    return { track: spotifyTrackSearch.bestResult };
  }

  protected getSpotifyTrackURI(string: string): SpotifyURI<"track"> {
    const id = (string.match(this.trackLinkRegex) || [])[1];

    return this.spotifyService.generateURI("track", id);
  }

  protected getSpotifyArtistURI(string: string): SpotifyURI<"artist"> {
    const id = (string.match(this.artistLinkRegex) || [])[1];

    return this.spotifyService.generateURI("artist", id);
  }

  protected getSpotifyAlbumURI(string: string): SpotifyURI<"album"> {
    const id = (string.match(this.albumLinkRegex) || [])[1];

    return this.spotifyService.generateURI("album", id);
  }

  protected containsLink(string: string | undefined, regex: RegExp): boolean {
    if (!string) return false;
    return regex.test(string);
  }

  private async confirmTrack(
    ctx: SpotifyArgumentsContext,
    track: SpotifyTrack
  ): Promise<boolean> {
    const embed = ctx.command
      .minimalEmbed()
      .setTitle("Couldn't find that exact track, did you mean:")
      .setDescription(
        `${italic(track.name)} by ${bold(track.artists.primary.name)}?`
      )
      .setThumbnail(track.album.images.largest.url);

    const confirmationEmbed = new ConfirmationView(ctx, embed).allowRejection();

    return await confirmationEmbed.awaitConfirmation(ctx);
  }
}
