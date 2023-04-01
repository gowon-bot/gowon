import { LogicError, MirrorballError } from "../../../../errors/errors";
import { bold, italic } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayNumber } from "../../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import {
  TrackTopAlbumsConnector,
  TrackTopAlbumsParams,
  TrackTopAlbumsResponse,
} from "./TrackTopAlbums.connector";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} satisfies ArgumentsMap;

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
        indexedRequired: true,
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
      .setAuthor(this.generateEmbedAuthor("Track top albums"))
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top albums for ${italic(
          track.name
        )} by ${bold(track.artist)} in ${perspective.possessive} library`
      )
      .setURL(LastfmLinks.libraryTrackPage(username, track.artist, track.name));

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
