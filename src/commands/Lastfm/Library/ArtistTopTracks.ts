import { NoScrobblesOfArtistError } from "../../../errors/commands/library";
import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { displayNumber } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { LilacTracksService } from "../../../services/lilac/LilacTracksService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistTopTracks extends LilacBaseCommand<typeof args> {
  idSeed = "weeekly soojin";

  aliases = ["att", "at", "iatt", "favs"];
  subcategory = "library";
  description = "Displays your top scrobbled tracks from an artist";

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);
  lilacTracksService = ServiceRegistry.get(LilacTracksService);
  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

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

    const { trackCounts: topTracks } =
      await this.lilacTracksService.listAmbiguousCounts(this.ctx, {
        track: { artist: { name: artistName } },
        users: [{ discordID: dbUser.discordID }],
      });

    const [correctedArtistName] =
      await this.lilacArtistsService.correctArtistNames(this.ctx, [artistName]);

    if (topTracks.length < 1) {
      throw new NoScrobblesOfArtistError(
        perspective,
        correctedArtistName,
        await this.redirectHelp(this.parsedArguments.artist)
      );
    }

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top ${bold(
          correctedArtistName
        )} tracks for ${username}`
      )
      .setURL(
        LastfmLinks.libraryArtistTopTracks(username, correctedArtistName)
      );

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      pageSize: 15,
      items: topTracks,

      pageRenderer(trackCounts) {
        return trackCounts
          .map(
            (trackCount) =>
              `${displayNumber(trackCount.playcount, "play")} - ${bold(
                trackCount.track.name
              )}`
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
