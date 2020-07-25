import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { ListCommand } from "./ListCommand";

export default class AlbumList extends ListCommand {
  aliases = ["llist", "allist", "topalbums", "topalbum", "albums"];
  description = "Shows your top albums";
  shouldBeIndexed = true;

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let topAlbums = await this.lastFMService.topAlbums(
      username,
      this.listAmount,
      1,
      this.timePeriod
    );

    let messageEmbed = new MessageEmbed()
      .setTitle(
        `Top ${numberDisplay(this.listAmount, "album")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topAlbums.album
          .map(
            (a) =>
              `${numberDisplay(
                a.playcount,
                "play"
              )} - ${a.name.bold()} by ${a.artist.name.italic()}`
          )
          .join("\n")
      );

    await message.channel.send(messageEmbed);
  }
}
