import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { MessageEmbed } from "discord.js";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const reverse = (s: string) =>
  s.split("").reverse().join("").replace("(", ")").replace(")", "(");
const reverseLinks = (s: string) =>
  s.replace(/(?<=\[)[^\]]*(?=\])/g, (match) => reverse(match));

export default class NowPlaying extends NowPlayingBaseCommand {
  idSeed = "stayc isa";

  aliases = ["np", "fm", "mf"];
  description = "Displays the now playing or last played track from Last.fm";

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    let { username, requestable, discordUser } =
      await this.nowPlayingMentions();

    let nowPlayingResponse = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1,
    });

    let nowPlaying = nowPlayingResponse.first();

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, username);

    let [artistInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, nowPlaying.artist),
    ]);

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    this.tagConsolidator.addTags(artistInfo.value?.tags || []);

    let lineConsolidator = new LineConsolidator();

    let artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let scrobbleCount = this.scrobbleCount(nowPlayingResponse);

    lineConsolidator.addLines(
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: this.tagConsolidator.consolidateAsStrings().join(" ‧ "),
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

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
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

    const author = (embed.author = {
      ...embed.author,
      name:
        embed.author?.name!.replace(
          /(?<=(Now playing|Last scrobbled) for ).*/i,
          (match) => reverse(match)
        ) || "",
    });

    embed.setAuthor(author);

    return embed;
  }
}
