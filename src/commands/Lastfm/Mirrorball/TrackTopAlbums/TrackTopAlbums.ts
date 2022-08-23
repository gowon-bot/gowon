import { MirrorballError, LogicError } from "../../../../errors/errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  TrackTopAlbumsConnector,
  TrackTopAlbumsParams,
  TrackTopAlbumsResponse,
} from "./TrackTopAlbums.connector";
import { displayNumber } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { bold, italic } from "../../../../helpers/discord";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} as const;

export default class TrackTopAlbums extends MirrorballBaseCommand<
  TrackTopAlbumsResponse,
  TrackTopAlbumsParams,
  typeof args
> {
  connector = new TrackTopAlbumsConnector();

  idSeed = "shasha soyeop";

  aliases = ["tal"];
  subcategory = "library";
  description = "Displays your top scrobbled albums from a track";

  slashCommand = true;

  arguments = args;

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
        reverseLookup: { required: true },
        requireIndexed: true,
      });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, {
        redirect: true,
      });

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
      user: { discordID: dbUser.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { topAlbums, track } = response.trackTopAlbums;

    if (topAlbums.length < 1) {
      throw new LogicError(
        `${perspective.plusToHave} no scrobbles for ${italic(
          track.name
        )} by ${bold(track.artist)}!`
      );
    }

    const totalScrobbles = topAlbums.reduce((sum, l) => sum + l.playcount, 0);
    const average = totalScrobbles / topAlbums.length;

    const embed = this.newEmbed()
      .setTitle(
        `Top albums for ${italic(track.name)} by ${bold(track.artist)} in ${
          perspective.possessive
        } library`
      )
      .setURL(
        LinkGenerator.libraryTrackPage(username, track.artist, track.name)
      );

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      pageSize: 15,
      items: topAlbums,

      pageRenderer(albums) {
        return albums
          .map(
            (album) =>
              `${displayNumber(album.playcount, "play")} - ${bold(
                album.track.album?.name || "(no album)"
              )}`
          )
          .join("\n");
      },

      overrides: {
        itemName: "album",
        embedDescription:
          italic(
            `${displayNumber(
              totalScrobbles,
              "total scrobble"
            )}, ${displayNumber(
              topAlbums.length,
              "total album"
            )}, ${displayNumber(
              average.toFixed(2),
              "average scrobble"
            )} per album`
          ) + "\n",
      },
    });

    simpleScrollingEmbed.send();
  }
}
