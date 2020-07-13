import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  aliases = ["tlist", "toptracks"];
  description = "Shows your top tracks";
  shouldBeIndexed = true;

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let topTracks = await this.lastFMService.topTracks(
      username,
      this.listAmount,
      1,
      this.timePeriod
    );

    let messageEmbed = new MessageEmbed()
      .setTitle(
        `Top ${numberDisplay(this.listAmount, "track")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topTracks.track
          .map(
            (a) =>
              `${numberDisplay(a.playcount, "play")} - **${a.name}** by _${
                a.artist.name
              }_`
          )
          .join("\n")
      );

    await message.channel.send(messageEmbed);
  }
}
