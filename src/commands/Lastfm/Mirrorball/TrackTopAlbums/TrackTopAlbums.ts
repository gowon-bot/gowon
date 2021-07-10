import { MirrorballError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  TrackTopAlbumsConnector,
  TrackTopAlbumsParams,
  TrackTopAlbumsResponse,
} from "./TrackTopAlbums.connector";
import { displayNumber } from "../../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
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

  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  async run() {
    const { username, senderUser, senderRequestable, dbUser, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
        reverseLookup: { required: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(senderRequestable, true);

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
      user: { discordID: user.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { topAlbums, track } = response.trackTopAlbums;

    if (topAlbums.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles for ${track.name.italic()} by ${track.artist.strong()}!`
      );
    }
    const embed = this.newEmbed()
      .setTitle(
        `Top albums for ${track.name.italic()} by ${track.artist.strong()} in ${
          perspective.possessive
        } library`
      )
      .setURL(
        LinkGenerator.libraryTrackPage(username, track.artist, track.name)
      );

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        pageSize: 15,
        items: topAlbums,

        pageRenderer(albums) {
          return albums
            .map(
              (album) =>
                `${displayNumber(album.playcount, "play")} - ${(
                  album.track.album?.name || "(no album)"
                ).strong()}`
            )
            .join("\n");
        },
      },
      { itemName: "album" }
    );

    simpleScrollingEmbed.send();
  }
}
