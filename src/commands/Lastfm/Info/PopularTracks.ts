import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    positions: {
      index: { start: 1, stop: 2 },
      splitOn: "|",
      join: false,
      default: ["1"],
    },
  },
} as const;

export default class PopularTracks extends InfoCommand<typeof args> {
  idSeed = "csvc dalchong";

  shouldBeIndexed = true;
  usage = ["", "artist", "artist | start | stop"];

  aliases = ["pop"];
  description = "Displays the most popular tracks for an artist on Last.fm";
  arguments: Arguments = args;

  async run() {
    let position = {
      start: toInt(this.parsedArguments.positions![0]),
      end: -1,
    };

    position.end =
      toInt((this.parsedArguments.positions as string[])[1]) ||
      position.start + 2;

    if (position.end < position.start)
      [position.start, position.end] = [position.end, position.start];

    if (position.end - position.start > 9)
      throw new LogicError("those two positions are too far apart!");

    let { senderRequestable } = await this.parseMentions();

    const artist = await this.lastFMArguments.getArtist(senderRequestable);

    // https://i0.wp.com/media.boingboing.net/wp-content/uploads/2016/11/bcf.png?fit=680%2C445&ssl=1
    let limit =
        10 +
        (~~((position.start - 1) / 10) !== ~~((position.end - 1) / 10)
          ? 10
          : 0),
      page = ~~((position.start + 1) / limit),
      sliceStart = (position.start % 10) - (position.start % 10 === 0 ? -9 : 1),
      sliceEnd = sliceStart + (position.end - position.start) + 1;

    let topTracks = await this.lastFMService.artistPopularTracks({
      artist,
      limit,
      page,
    });

    let tracksToDisplay = topTracks.tracks.slice(sliceStart, sliceEnd);

    let embed = this.newEmbed()
      .setTitle(`Top tracks for ${tracksToDisplay[0]?.artist?.name || artist}`)
      .setDescription(
        tracksToDisplay
          .map(
            (t, idx) =>
              `${position.start + idx}. ${t.name.strong()} (${displayNumber(
                t.listeners,
                "listener"
              )})`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
