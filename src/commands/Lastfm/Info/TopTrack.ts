import { MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";

export default class TopTrack extends InfoCommand {
  shouldBeIndexed = true;
  usage = ["", "artist", "artist | start | stop"];

  aliases = ["tt"];
  description = "Display the top track for an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      positions: {
        index: { start: 1, stop: 2 },
        splitOn: "|",
        join: false,
        default: ["1"],
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      position = {
        start: (this.parsedArguments.positions as string[])[0].toInt(),
        end: -1,
      };

    position.end =
      (this.parsedArguments.positions as string[])[1]?.toInt() ||
      position.start + 2;

    if (position.end < position.start)
      [position.start, position.end] = [position.end, position.start];

    if (position.end - position.start > 9)
      throw new LogicError("those two positions are too far apart!");

    let { senderUsername } = await this.parseMentions();

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    // https://i0.wp.com/media.boingboing.net/wp-content/uploads/2016/11/bcf.png?fit=680%2C445&ssl=1
    let limit =
        10 +
        (~~((position.start - 1) / 10) !== ~~((position.end - 1) / 10)
          ? 10
          : 0),
      page = ~~((position.start + 1) / limit),
      sliceStart = (position.start % 10) - (position.start % 10 === 0 ? -9 : 1),
      sliceEnd = sliceStart + (position.end - position.start) + 1;

    let topTracks = await this.lastFMService.artistTopTracks({
      artist,
      limit,
      page,
    });

    let tracksToDisplay = topTracks.track.slice(sliceStart, sliceEnd);

    let embed = new MessageEmbed()
      .setTitle(`Top tracks for ${tracksToDisplay[0]?.artist?.name || artist}`)
      .setDescription(
        tracksToDisplay
          .map(
            (t, idx) =>
              `${position.start + idx}. ${t.name.bold()} (${numberDisplay(
                t.listeners,
                "listener"
              )})`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
