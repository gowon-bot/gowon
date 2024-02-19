import { bold } from "../../../helpers/discord";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { InfoCommand } from "./InfoCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export default class PopularTracks extends InfoCommand<typeof args> {
  idSeed = "csvc dalchong";

  shouldBeIndexed = true;
  usage = ["", "artist", "artist | start | stop"];

  slashCommand = true;

  aliases = ["pop"];
  description = "Displays the most popular tracks for an artist on Last.fm";

  arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions();

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const topTracks = await this.lastFMService.artistPopularTracks(this.ctx, {
      artist,
      limit: 1000,
    });

    const embed = this.minimalEmbed().setTitle(
      `Top tracks on Last.fm for ${topTracks.tracks[0]?.artist?.name || artist}`
    );

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: topTracks.tracks,
      pageSize: 10,

      pageRenderer(items, { offset }) {
        return displayNumberedList(
          items.map(
            (t) => `${bold(t.name)} (${displayNumber(t.listeners, "listener")})`
          ),
          offset
        );
      },
      overrides: { itemName: "track" },
    });

    await this.reply(scrollingEmbed);
  }
}
