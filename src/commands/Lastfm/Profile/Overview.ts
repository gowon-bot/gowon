import { getOrdinal } from "../../../helpers";
import { isGowon } from "../../../helpers/bots";
import { bold, italic } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm";
import { Emoji } from "../../../lib/emoji/Emoji";
import { gap, Line, LineConsolidator } from "../../../lib/LineConsolidator";
import { Perspective } from "../../../lib/Perspective";
import { displayNumber } from "../../../lib/ui/displays";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class Overview extends ProfileChildCommand {
  idSeed = "fx victoria";

  description = "Shows information about you and your library";
  aliases = ["all"];
  slashCommand = true;

  showLoadingAfter = 5;

  async run() {
    const perspective = Perspective.perspective(
      this.senderUsername,
      this.username
    );

    const [friends] = await Promise.all([
      this.lastFMService.userGetFriends(this.ctx, {
        username: this.requestable,
        limit: 1,
      }),
      await this.calculator.cacheAll(),
    ]);

    const image = (await this.calculator.userInfo()).images.get("large");

    const description = new LineConsolidator().addLines(
      this.getSpecialUserEmoji(),
      italic(`Scrobbling since ${await this.calculator.joined()}`),
      italic(`Following ${displayNumber(friends.meta.total, "user")}`),

      gap(),

      `**Scrobbles**: ${await this.calculator.totalScrobbles()} (_${await this.calculator.avgPerDay()}/day_)`,
      `**Artists**: ${await this.calculator.totalArtists()} (_${await this.calculator.avgScrobblesPerArtist()} scrobbles/artist_)`,
      `**Albums**: ${await this.calculator.totalAlbums()} (_${await this.calculator.avgScrobblesPerAlbum()} scrobbles/album_)`,
      `**Tracks**: ${await this.calculator.totalTracks()} (_${await this.calculator.avgScrobblesPerTrack()} scrobbles/track_)`,

      gap(),

      `**Albums per artist**: ${await this.calculator.albumsPerArtist()}`,
      `**Tracks per artist**: ${await this.calculator.tracksPerArtist()}`,
      `**Tracks per album**: ${await this.calculator.tracksPerAlbum()}`,

      gap(),

      `**H-Index**: ${await this.calculator.hIndex()}`,
      `**\\# of artists to equal 50% of scrobbles**: ${
        (await this.calculator.topPercent(50)).count
      }`,
      `**Total scrobbles for top 10 artists**: ${await this.calculator.sumTop(
        10
      )}`,
      `${perspective.upper.possessive} top 10 artists account for: ${bold(
        (await this.calculator.sumTopPercent(10)).asString
      )}% of ${perspective.possessivePronoun} total scrobbles`,

      gap(),

      ...(await this.getPlaysOverTiers(perspective)),

      await this.getCrownStats(perspective),

      gap(),

      await this.getBreadthStat(),
      `**Number of unique tags**: ${(
        await this.calculator.uniqueTags()
      ).toString()}`
    );

    const embed = this.profileEmbed()
      .setTitle(this.username)
      .setThumbnail(image)
      .setDescription(description);

    await this.reply(embed);
  }

  private getSpecialUserEmoji(): string {
    return this.gowonClient.isDeveloper(this.discordID)
      ? `${Emoji.typescript} _Author_\n`
      : isGowon(this.discordID)
      ? `${Emoji.gowonswag2} _Gowon_\n`
      : this.gowonClient.isDeveloperOf("chuu", this.discordID)
      ? `${Emoji.ish} _Ish_\n`
      : this.gowonClient.isDeveloperOf("fmbot", this.discordID)
      ? `${Emoji.fmbot} _Frikandel_\n`
      : this.gowonClient.isDeveloperOf("rem", this.discordID)
      ? `${Emoji.rem} _Enya_\n`
      : this.gowonClient.isAlphaTester(this.discordID)
      ? `${Emoji.gowonheart} _Alpha tester_\n`
      : "";
  }

  private async getPlaysOverTiers(perspective: Perspective): Promise<string[]> {
    return [
      `Among ${perspective.possessivePronoun} top ${displayNumber(
        (await this.calculator.totalArtists()).asNumber > 1000
          ? 1000
          : (await this.calculator.totalArtists()).asNumber,
        "artist"
      )}, ${perspective.plusToHave}...`,

      ...(await this.calculator.tierPlaysOver(this.playsoverTiers, 6)).map(
        (po) =>
          `**${displayNumber(po.count, "**artist")} with ${displayNumber(
            po.tier,
            "+ scrobble",
            true
          )}`
      ),
    ];
  }

  private async getCrownStats(perspective: Perspective): Promise<Line> {
    const rank = await this.calculator.crownsRank();

    return {
      shouldDisplay:
        (await this.calculator.hasCrownStats()) &&
        this.humanizedPeriod === "overall",
      string: `\n**Total crowns**: ${rank!.count} (ranked ${italic(
        getOrdinal(toInt(rank!.rank))
      )})
For every ${bold(
        displayNumber(
          (await this.calculator.artistsPerCrown())!.asString,
          "eligible artist"
        )
      )}, ${perspective.plusToHave} a crown
For every ${bold(
        displayNumber(
          (await this.calculator.scrobblesPerCrown())!.asString,
          "scrobble"
        )
      )}, ${perspective.plusToHave} a crown`,
    };
  }

  private async getBreadthStat(): Promise<Line> {
    let breadth: { rating: number; ratingString: string } | undefined;

    try {
      breadth = await this.calculator.breadth();
    } catch {}

    return {
      shouldDisplay: !!breadth,
      string: `**Breadth rating**: ${breadth!.rating.toFixed(1)} _(${
        breadth!.ratingString
      })_`,
    };
  }
}
