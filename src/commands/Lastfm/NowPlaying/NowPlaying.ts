import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand, nowPlayingArgs } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { MessageEmbed } from "discord.js";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { CommandRedirect } from "../../../lib/command/BaseCommand";
import NowPlayingVerbose from "./NowPlayingVerbose";
import NowPlayingCompact from "./NowPlayingCompact";
import NowPlayingAlbum from "./NowPlayingAlbum";
import NowPlayingCombo from "./NowPlayingCombo";
import NowPlayingCustom from "./NowPlayingCustom";

const reverse = (s: string) =>
  s.split("").reverse().join("").replace("(", ")").replace(")", "(");
const reverseLinks = (s: string) =>
  s.replace(/(?<=\[)[^\]]*(?=\])/g, (match) => reverse(match));

const args = {
  type: new StringArgument({
    description: "Controls what type of embed Gowon uses",
    choices: [
      { name: "verbose" },
      { name: "compact" },
      { name: "track", value: "verbose" },
      { name: "album" },
      { name: "combo" },
      { name: "custom" },
    ],
    unstrictChoices: true,
  }),
  ...nowPlayingArgs,
} as const;

export default class NowPlaying extends NowPlayingBaseCommand<typeof args> {
  idSeed = "stayc isa";

  aliases = ["np", "fm", "mf"];
  slashCommandName = "fm";
  description =
    "Now playing | Displays the now playing or last played track from Last.fm";

  slashCommand = true;
  twitterCommand = true;

  crownsService = ServiceRegistry.get(CrownsService);

  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => args.type === "verbose",
      redirectTo: NowPlayingVerbose,
    },
    {
      when: (args) => args.type === "compact",
      redirectTo: NowPlayingCompact,
    },
    {
      when: (args) => args.type === "album",
      redirectTo: NowPlayingAlbum,
    },
    {
      when: (args) => args.type === "combo",
      redirectTo: NowPlayingCombo,
    },
    {
      when: (args) => args.type === "custom",
      redirectTo: NowPlayingCustom,
    },
  ];

  async run() {
    let { username, requestable, discordUser } =
      await this.nowPlayingMentions();

    let nowPlayingResponse = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable || "flushed_emoji",
      limit: 1,
    });

    let nowPlaying = nowPlayingResponse.first();

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    if (this.payload.isTweet()) {
      this.responder.twitter(
        this.ctx,
        `🎶 ${
          nowPlaying.isNowPlaying ? "Now playing" : "Last scrobbled"
        } for ${username}\n\n${nowPlaying.name} by ${nowPlaying.artist}\nfrom ${
          nowPlaying.album
        }`
      );
      return;
    }

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

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    this.tagConsolidator.addTags(this.ctx, artistInfo.value?.tags || []);

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

    nowPlayingEmbed.setFooter({ text: lineConsolidator.consolidate() });

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

    embed.setFooter({ text: footer.join("\n") });

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
