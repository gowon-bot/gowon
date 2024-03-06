import { NoScrobblesOfArtistError } from "../../../../errors/commands/library";
import { MirrorballError } from "../../../../errors/errors";
import { bold, italic } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { displayNumber } from "../../../../lib/ui/displays";
import { ScrollingListView } from "../../../../lib/ui/views/ScrollingListView";
import { RedirectsService } from "../../../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import {
  ArtistTopTracksConnector,
  ArtistTopTracksParams,
  ArtistTopTracksResponse,
} from "./ArtistTopTracks.connector";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
  ...standardMentions,
} satisfies ArgumentsMap;

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

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { username, senderRequestable, perspective, dbUser } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        dbUserRequired: true,
        syncedRequired: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
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
      throw new NoScrobblesOfArtistError(
        perspective,
        artist.name,
        await this.redirectHelp(this.parsedArguments.artist)
      );
    }
    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top ${bold(
          artist.name
        )} tracks for ${username}`
      )
      .setURL(LastfmLinks.libraryArtistTopTracks(username, artist.name));

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      pageSize: 15,
      items: topTracks,

      pageRenderer(tracks) {
        return tracks
          .map(
            (track) =>
              `${displayNumber(track.playcount, "play")} - ${bold(track.name)}`
          )
          .join("\n");
      },

      overrides: {
        itemName: "track",
        embedDescription:
          italic(
            `${displayNumber(
              totalScrobbles,
              "total scrobble"
            )}, ${displayNumber(
              topTracks.length,
              "total track"
            )}, ${displayNumber(
              average.toFixed(2),
              "average scrobble"
            )} per track`
          ) + "\n",
      },
    });

    await this.reply(simpleScrollingEmbed);
  }

  private async redirectHelp(artistName?: string): Promise<string> {
    if (artistName) {
      const redirect = await this.redirectsService.getRedirect(
        this.ctx,
        artistName
      );

      if (redirect?.to) {
        return `\n\nLooking for ${bold(redirect.from)}? Try \`${
          this.prefix
        }at ${artistName} -nr\``;
      }
    }

    return "";
  }
}
