import { MirrorballError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  ArtistTopTracksConnector,
  ArtistTopTracksParams,
  ArtistTopTracksResponse,
} from "./ArtistTopTracks.connector";
import { displayNumber } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} as const;

export default class ArtistTopTracks extends MirrorballBaseCommand<
  ArtistTopTracksResponse,
  ArtistTopTracksParams,
  typeof args
> {
  connector = new ArtistTopTracksConnector();

  idSeed = "weeekly soojin";

  aliases = ["att", "at", "iatt", "favs"];
  subcategory = "library";
  description = "Displays your top scrobbled tracks from an artist";

  arguments = args;

  async run() {
    const { username, senderRequestable, perspective, dbUser } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        reverseLookup: { required: true },
        requireIndexed: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      !this.parsedArguments.noRedirect
    );

    const response = await this.query({
      artist: { name: artistName },
      user: { discordID: dbUser.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { topTracks, artist } = response.artistTopTracks;

    if (topTracks.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles of any songs from ${artist.name.strong()}!`
      );
    }
    const embed = this.newEmbed()
      .setTitle(`Top ${artist.name.strong()} tracks for ${username}`)
      .setURL(LinkGenerator.libraryArtistTopTracks(username, artist.name));

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
      pageSize: 15,
      items: topTracks,

      pageRenderer(tracks) {
        return tracks
          .map(
            (track) =>
              `${displayNumber(
                track.playcount,
                "play"
              )} - ${track.name.strong()}`
          )
          .join("\n");
      },

      overrides: {
        itemName: "track",
        embedDescription:
          `${displayNumber(totalScrobbles, "total scrobble")}, ${displayNumber(
            topTracks.length,
            "total track"
          )}, ${displayNumber(
            average.toFixed(2),
            "average scrobble"
          )} per track`.italic() + "\n",
      },
    });

    simpleScrollingEmbed.send();
  }
}
