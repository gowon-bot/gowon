import { LogicError } from "../../../errors/errors";
import { bold, italic } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { SpotifyChildCommand } from "./SpotifyChildCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export class Like extends SpotifyChildCommand<typeof args> {
  idSeed = "pink fantasy daewang";

  description = "Adds a song to your Spotify liked songs";
  aliases = ["slike", "like"];
  usage = ["", "artist | song", "(in reply to a Spotify song link)"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "unlike",
      description: "Removes a song from your Spotify liked songs",
      variation: ["unlike"],
      separateSlashCommand: true,
    },
  ];

  arguments = args;

  async run() {
    const unlike = this.variationWasUsed("unlike");

    const { senderRequestable } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const { track, askedConfirmation } = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      if (askedConfirmation) return;

      throw new LogicError(
        `Couldn't find a track to ${unlike ? "un" : ""}like!`
      );
    }

    const trackInLibrary = await this.spotifyService.checkIfSongIsInLibrary(
      this.ctx,
      track.uri.asID
    );

    if (unlike) {
      await this.spotifyService.removeTrackFromLibrary(
        this.ctx,
        track.uri.asID
      );
    } else {
      await this.spotifyService.saveTrackToLibrary(this.ctx, track.uri.asID);
    }

    const artistName = bold(track.artists.primary.name);
    const trackName = italic(track.name);

    const description = new LineConsolidator().addLines(
      {
        shouldDisplay: unlike && trackInLibrary,
        string: `${Emoji.brokenHeart} Succesfully unliked:\n${trackName} by ${artistName}!`,
      },
      {
        shouldDisplay: unlike && !trackInLibrary,
        string: `${Emoji.mendingHeart} Already not in your library:\n${trackName} by ${artistName}`,
      },
      {
        shouldDisplay: !unlike && !trackInLibrary,
        string: `${Emoji.heart} Succesfully liked:\n${trackName} by ${artistName}!`,
      },
      {
        shouldDisplay: !unlike && trackInLibrary,
        string: `${Emoji.revolvingHearts} Already in your library:\n${trackName} by ${artistName}`,
      }
    );

    const embed = this.minimalEmbed()
      .setHeader(`Spotify ${unlike ? "un" : ""}like song`)
      .setDescription(description)
      .setThumbnail(track.album.images.largest.url);

    await this.reply(embed);
  }
}
