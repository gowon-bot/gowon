import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay, ucFirst } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { CrownsService } from "../../../services/dbservices/CrownsService";

export default class ArtistInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ai", "as"];
  description = "Display some information about an artist";
  usage = ["", "artist"];

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

  crownsService = new CrownsService();

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let {
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username }),
      this.lastFMService.userInfo({ username }),
    ]);

    let crown = await this.crownsService.getCrownDisplay(
      artistInfo.name,
      message
    );

    this.tagConsolidator.addTags(artistInfo.tags.tag);

    let embed = new MessageEmbed()
      .setTitle(artistInfo.name)
      .setURL(artistInfo.url)
      .setDescription(
        this.scrubReadMore(artistInfo.bio.summary.trimRight()) +
          (artistInfo.similar.artist.length
            ? "\n\n**Similar artists:** " +
              artistInfo.similar.artist.map((t) => t.name).join(" ‧ ")
            : "") +
          (this.tagConsolidator.hasTags()
            ? "\n**Tags:** " +
              this.tagConsolidator.consolidate().join(" ‧ ") +
              "\n"
            : "") +
          `\n**Listeners**: ${numberDisplay(artistInfo.stats.listeners)}
**Playcount**: ${numberDisplay(artistInfo.stats.playcount)}
${crown ? `**Crown**: ${crown?.user?.username}` : ""}`
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
