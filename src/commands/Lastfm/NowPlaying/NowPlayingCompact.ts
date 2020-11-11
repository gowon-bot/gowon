import { Message } from "discord.js";
import {
  LinkGenerator,
  parseLastFMTrackResponse,
} from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { sanitizeForDiscord } from "../../../helpers/discord";

export default class NowPlayingCompact extends LastFMBaseCommand {
  aliases = ["npc", "fmc"];
  description = "Displays the now playing or last played track from Last.fm";
  subcategory = "nowplaying";
  usage = [
    "",
    "@user (will show their now playing)",
    "@user hey check out this song (will show your now playing)",
  ];
  arguments: Arguments = {
    inputs: {
      otherWords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  async run(message: Message) {
    let otherWords = this.parsedArguments.otherWords as string | undefined;

    let { username, senderUsername } = await this.parseMentions();

    if (
      otherWords &&
      !this.parsedArguments.userID &&
      !this.parsedArguments.lfmUser
    ) {
      username = senderUsername;
    }

    let nowPlaying = await this.lastFMService.nowPlaying(username);

    let track = parseLastFMTrackResponse(nowPlaying);

    let links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    let nowPlayingEmbed = this.newEmbed()
      .setAuthor(
        `${
          nowPlaying["@attr"]?.nowplaying ? "Now playing" : "Last scrobbled"
        } for ${username}`,
        message.author.avatarURL() || undefined,
        LinkGenerator.userPage(username)
      )
      .setTitle(sanitizeForDiscord(track.name))
      .setURL(LinkGenerator.trackPage(track.artist, track.name))
      .setDescription(
        `by ${links.artist.bold()}` +
          (track.album ? ` from ${links.album.italic()}` : "")
      )
      .setThumbnail(
        nowPlaying.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    let sentMessage = await this.send(nowPlayingEmbed);

    if (
      track.artist.toLowerCase() === "twice" &&
      track.name.toLowerCase() === "jaljayo good night"
    ) {
      sentMessage.react("😴");
    }
  }
}
