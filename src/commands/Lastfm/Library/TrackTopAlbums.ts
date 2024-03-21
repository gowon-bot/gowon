import { NoScrobblesOfTrackError } from "../../../errors/commands/library";
import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayNumber } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacTracksService } from "../../../services/lilac/LilacTracksService";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackTopAlbums extends LilacBaseCommand<typeof args> {
  idSeed = "shasha soyeop";

  aliases = ["tal"];
  subcategory = "library";
  description = "Displays your top scrobbled albums from a track";

  slashCommand = true;

  arguments = args;

  lilacTracksService = ServiceRegistry.get(LilacTracksService);

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
        reverseLookup: { required: true },
        syncedRequired: true,
      });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, {
        redirect: true,
      });

    const response = await this.lilacTracksService.listCounts(this.ctx, {
      track: { name: trackName, artist: { name: artistName } },
      users: [{ discordID: dbUser.discordID }],
    });

    const track = response.trackCounts[0].track;
    const trackCounts = response.trackCounts;

    if (trackCounts.length < 1) {
      throw new NoScrobblesOfTrackError(
        perspective,
        track.artist.name,
        track.name
      );
    }

    const totalScrobbles = trackCounts.reduce((sum, l) => sum + l.playcount, 0);
    const average = totalScrobbles / trackCounts.length;

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top albums for ${italic(
          track.name
        )} by ${bold(track.artist.name)} in ${perspective.possessive} library`
      )
      .setURL(
        LastfmLinks.libraryTrackPage(username, track.artist.name, track.name)
      );

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      pageSize: 15,
      items: trackCounts,

      pageRenderer(trackCounts) {
        return trackCounts
          .map(
            (tc) =>
              `${displayNumber(tc.playcount, "play")} - ${bold(
                tc.track.album?.name || "(no album)"
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
              trackCounts.length,
              "total album"
            )}, ${displayNumber(
              average.toFixed(2),
              "average scrobble"
            )} per album`
          ) + "\n",
      },
    });

    await this.reply(simpleScrollingEmbed);
  }
}
