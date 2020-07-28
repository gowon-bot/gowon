import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay, ucFirst } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";

export default class ArtistInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ai", "as"];
  description = "Display some information about an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run(message: Message) {
    let artistName = this.parsedArguments.artist as string;

    let {
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    // let artistInfo = await this.lastFMService.artistInfo(artistName);
    let [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo(artistName, username),
      this.lastFMService.userInfo(username),
    ]);

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
      )
      .addField(
        `${ucFirst(perspective.possessive)} stats`,
        `\`${numberDisplay(
          artistInfo.stats.userplaycount,
          "` play",
          true
        )} by ${perspective.objectPronoun} (${calculatePercent(
          artistInfo.stats.userplaycount,
          userInfo.playcount
        ).bold()}% of ${perspective.possesivePronoun} total scrobbles)
${ucFirst(perspective.regularVerb("account"))} for ${calculatePercent(
          artistInfo.stats.userplaycount,
          artistInfo.stats.playcount,
          4
        ).bold()}% of all ${artistInfo.name} scrobbles!
        `
      );

    message.channel.send(embed);
  }
}
