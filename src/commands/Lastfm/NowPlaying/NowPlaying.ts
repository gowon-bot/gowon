import { parseLastFMTrackResponse } from "../../../helpers/lastFM";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { MessageEmbed } from "discord.js";

const reverse = (s: string) =>
  s.split("").reverse().join("").replace("(", ")").replace(")", "(");
const reverseLinks = (s: string) =>
  s.replace(/(?<=\[)[^\]]*(?=\])/g, (match) => reverse(match));

export default class NowPlaying extends NowPlayingBaseCommand {
  idSeed = "stayc isa";

  aliases = ["np", "fm", "mf"];
  description = "Displays the now playing or last played track from Last.fm";

  crownsService = new CrownsService(this.logger);

  async run() {
    let { username, discordUser } = await this.nowPlayingMentions();

    let nowPlayingResponse = await this.lastFMService.recentTracks({
      username,
      limit: 1,
    });

    let nowPlaying = nowPlayingResponse.track[0];

    let track = parseLastFMTrackResponse(nowPlaying);

    if (nowPlaying["@attr"]?.nowplaying) this.scrobble(track);

    this.tagConsolidator.blacklistTags(track.artist, track.name);

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username);

    let [artistInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo({ artist: track.artist, username }),
      this.crownsService.getCrownDisplay(track.artist, this.guild),
    ]);

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    this.tagConsolidator.addTags(artistInfo.value?.tags?.tag || []);

    let lineConsolidator = new LineConsolidator();

    let artistPlays = this.artistPlays(artistInfo, track, isCrownHolder);
    let noArtistData = this.noArtistData(track);
    let scrobbleCount = this.scrobbleCount(nowPlayingResponse);

    lineConsolidator.addLines(
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: this.tagConsolidator.tags.join(" ‧ "),
      },
      {
        shouldDisplay: !!artistInfo.value && !!crownString,
        string: `${artistPlays} • ${scrobbleCount} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistInfo.value && !crownString,
        string: `${artistPlays} • ${scrobbleCount}`,
      },
      {
        shouldDisplay: !artistInfo.value && !!crownString,
        string: `${noArtistData} • ${scrobbleCount} • ${crownString}`,
      },
      {
        shouldDisplay: !artistInfo.value && !crownString,
        string: `${noArtistData} • ${scrobbleCount}`,
      }
    );

    nowPlayingEmbed.setFooter(lineConsolidator.consolidate());

    if (this.runAs.variationWasUsed("mf")) {
      nowPlayingEmbed = this.reverseEmbed(nowPlayingEmbed);
    }

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, track);
  }

  private reverseEmbed(embed: MessageEmbed): MessageEmbed {
    embed.setTitle(reverse(embed.title!));
    embed.setDescription(reverseLinks(embed.description!));

    let footer = embed.footer?.text!.split("\n") as [string, string];

    footer[0] = footer[0]
      .split(" ‧ ")
      .map((t) => reverse(t))
      .join(" ‧ ");
    footer[1] = footer[1].replace(/(?<= ).*(?= scrobbles •)/, (match) =>
      reverse(match)
    );

    embed.setFooter(footer.join("\n"));

    const author = embed.author?.name!.replace(
      /(?<=(Now playing|Last scrobbled) for ).*/i,
      (match) => reverse(match)
    );

    embed.setAuthor(author, undefined, embed.author?.url!);

    return embed;
  }
}
