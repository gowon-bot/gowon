import { bold } from "../../../helpers/discord";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
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

    const embed = this.authorEmbed()
      .setHeader("Popular tracks")
      .setTitle(
        `Top tracks for ${topTracks.tracks[0]?.artist?.name || artist}`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
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

    await this.send(scrollingEmbed);
  }
}
