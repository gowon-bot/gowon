import { InfoCommand } from "./InfoCommand";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";

const args = {
  ...prefabArguments.artist,
} as const;

export default class PopularTracks extends InfoCommand<typeof args> {
  idSeed = "csvc dalchong";

  shouldBeIndexed = true;
  usage = ["", "artist", "artist | start | stop"];

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

    const embed = this.newEmbed().setTitle(
      `Top tracks for ${topTracks.tracks[0]?.artist?.name || artist}`
    );

    const scrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
      items: topTracks.tracks,
      pageSize: 10,

      pageRenderer(items, { offset }) {
        return displayNumberedList(
          items.map(
            (t) =>
              `${t.name.strong()} (${displayNumber(t.listeners, "listener")})`
          ),
          offset
        );
      },
      overrides: { itemName: "track" },
    });

    scrollingEmbed.send();
  }
}
