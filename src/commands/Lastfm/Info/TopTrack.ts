import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { Logger } from "../../../lib/Logger";

export default class TopTrack extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["tt"];
  description = "Display the top track for an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      position: {
        index: { start: 1, stop: 2 },
        splitOn: "|",
        join: false,
        default: ["1"],
      },
    },
  };

  async run(message: Message) {
    let artistName = this.parsedArguments.artist as string,
      position = {
        start: (this.parsedArguments.position as string[])[0].toInt(),
        end: -1,
      };

    position.end =
      (this.parsedArguments.position as string[])[1]?.toInt() ||
      position.start + 2;

    if (position.end < position.start)
      [position.start, position.end] = [position.end, position.start];

    this.logger.log("position", Logger.formatObject(position));

    if (position.end - position.start > 9)
      throw new LogicError("those two positions are too far apart!");

    let { senderUsername } = await this.parseMentionedUsername(message);

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let topTracks = await this.lastFMService.artistTopTracks(
      artistName,
      10 + (~~(position.start / 10) === ~~(position.end / 10) ? 10 : 0),
      ~~(position.start / 10)
    );

    console.log(
      10 + (~~(position.start / 10) === ~~(position.end / 10) ? 10 : 0),
      ~~(position.start / 10)
    );

    let tracksToDisplay = topTracks.track.slice(
      (position.start % 10) - 1,
      (position.start % 10) + (position.end - position.start)
    );

    let embed = new MessageEmbed()
      .setTitle(
        `Top tracks for ${tracksToDisplay[0]?.artist?.name || artistName}`
      )
      .setDescription(
        tracksToDisplay
          .map(
            (t) =>
              `${
                t["@attr"].rank.toInt() + ~~(position.start / 10) * 10
              }. ${t.name.bold()} (${numberDisplay(t.listeners, "listener")})`
          )
          .join("\n")
      );

    await message.channel.send(embed);
  }
}
