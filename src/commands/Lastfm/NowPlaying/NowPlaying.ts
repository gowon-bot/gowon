import { MessageEmbed } from "discord.js";
import { promiseAllSettled } from "../../../helpers";
import { CommandRedirect } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { FMMode } from "../../../lib/settings/SettingValues";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import NowPlayingAlbum from "./NowPlayingAlbum";
import { nowPlayingArgs, NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import NowPlayingCombo from "./NowPlayingCombo";
import NowPlayingCompact from "./NowPlayingCompact";
import NowPlayingCustom from "./NowPlayingCustom";
import NowPlayingVerbose from "./NowPlayingVerbose";

const reverse = (s: string) =>
  s.split("").reverse().join("").replace("(", ")").replace(")", "(");
const reverseLinks = (s: string) =>
  s.replace(/(?<=\[)[^\]]*(?=\])/g, (match) => reverse(match));

const args = {
  type: new StringArgument({
    description: "Controls what type of embed Gowon uses",
    choices: [
      { name: FMMode.DEFAULT },
      { name: FMMode.VERBOSE },
      { name: FMMode.COMPACT },
      { name: "track", value: FMMode.VERBOSE },
      { name: FMMode.ALBUM },
      { name: FMMode.COMBO },
      { name: FMMode.CUSTOM },
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

  crownsService = ServiceRegistry.get(CrownsService);
  settingsService = ServiceRegistry.get(SettingsService);

  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => this.fmModeWasUsed(FMMode.VERBOSE, args.type),
      redirectTo: NowPlayingVerbose,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.COMPACT, args.type),
      redirectTo: NowPlayingCompact,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.ALBUM, args.type),
      redirectTo: NowPlayingAlbum,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.COMBO, args.type),
      redirectTo: NowPlayingCombo,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.CUSTOM, args.type),
      redirectTo: NowPlayingCustom,
    },
  ];

  async run() {
    const { username, requestable, discordUser } =
      await this.nowPlayingMentions();

    const nowPlayingResponse = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable || "flushed_emoji",
      limit: 1,
    });

    const nowPlaying = nowPlayingResponse.first();

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    this.tagConsolidator.blacklistTags(nowPlaying.artist, nowPlaying.name);

    let nowPlayingEmbed = await this.nowPlayingEmbed(nowPlaying, username);

    const [artistInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: nowPlaying.artist,
        username: requestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, nowPlaying.artist),
    ]);

    const { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      discordUser
    );

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    this.tagConsolidator.addTags(this.ctx, artistInfo.value?.tags || []);

    const lineConsolidator = new LineConsolidator();

    const artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    const noArtistData = this.noArtistData(nowPlaying);
    const scrobbleCount = this.scrobbleCount(nowPlayingResponse);

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

    if (this.extract.didMatch("mf")) {
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

  private fmModeWasUsed(mode: FMMode, input: string | undefined) {
    return (
      input?.toLowerCase() === mode ||
      (this.settingsService.get("defaultFMMode", {
        userID: this.author.id,
      }) === mode &&
        input?.toLowerCase() !== FMMode.DEFAULT)
    );
  }
}
