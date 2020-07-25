import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";

export default class ArtistInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ai"];
  description = "Display some information about an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artistName = this.parsedArguments.artist as string;

    
    if (!artistName) {
      let { senderUsername } = await this.parseMentionedUsername(message);
      
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistInfo = await this.lastFMService.artistInfo(artistName);

    let embed = new MessageEmbed()
      .setTitle(artistInfo.name)
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(artistInfo.stats.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(artistInfo.stats.playcount),
          inline: true,
        }
      )
      .setURL(artistInfo.url)
      .setDescription(
        this.scrubReadMore(artistInfo.bio.summary.trimRight()) +
          (artistInfo.similar.artist.length
            ? (!artistInfo.tags.tag.length ? "\n" : "\n\n") +
              "**Similar artists:** " +
              artistInfo.similar.artist.map((t) => t.name).join(" ‧ ")
            : "") +
          (artistInfo.tags.tag.length
            ? "\n**Tags:** " +
              artistInfo.tags.tag.map((t) => t.name).join(" ‧ ")
            : "")
      );

    message.channel.send(embed);
  }
}
