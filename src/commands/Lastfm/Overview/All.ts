import { OverviewChildCommand } from "./OverviewChildCommand";
import { getOrdinal } from "../../../helpers";
import { Emoji } from "../../../lib/Emoji";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { bold, italic } from "../../../helpers/discord";

export class All extends OverviewChildCommand {
  idSeed = "fx victoria";

  description = "Shows information about you and your library";
  slashCommand = true;

  showLoadingAfter = 5;

  async run() {
    const perspective = this.usersService.perspective(
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

    const { image } = await this.getAuthorDetails();

    const rank = await this.calculator.crownsRank();
    let breadth: { rating: number; ratingString: string } | undefined;
    try {
      breadth = await this.calculator.breadth();
    } catch {}

    const embed = (await this.overviewEmbed())
      .setThumbnail(image)
      .setDescription(
        `
${
  this.gowonClient.isDeveloper(this.discordID)
    ? `${Emoji.typescript} _Author_\n`
    : this.gowonClient.isGowon(this.discordID)
    ? `${Emoji.gowonswag2} _Gowon_\n`
    : this.gowonClient.isDeveloperOf("chuu", this.discordID)
    ? `${Emoji.ish} _Ish_\n`
    : this.gowonClient.isDeveloperOf("fmbot", this.discordID)
    ? `${Emoji.fmbot} _Frikandel_\n`
    : this.gowonClient.isDeveloperOf("rem", this.discordID)
    ? `${Emoji.rem} _Mex_\n`
    : this.gowonClient.isAlphaTester(this.discordID)
    ? `${Emoji.gowonheart} _Alpha tester_\n`
    : ""
}
_Scrobbling since ${await this.calculator.joined()}_
_Following ${displayNumber(friends.meta.total, "user")}_

**Scrobbles**: ${await this.calculator.totalScrobbles()} (_${await this.calculator.avgPerDay()}/day_)
**Artists**: ${await this.calculator.totalArtists()} (_${await this.calculator.avgScrobblesPerArtist()} scrobbles/artist_)
**Albums**: ${await this.calculator.totalAlbums()} (_${await this.calculator.avgScrobblesPerAlbum()} scrobbles/album_)
**Tracks**: ${await this.calculator.totalTracks()} (_${await this.calculator.avgScrobblesPerTrack()} scrobbles/track_)

**Albums per artist**: ${await this.calculator.albumsPerArtist()}
**Tracks per artist**: ${await this.calculator.tracksPerArtist()}
**Tracks per album**: ${await this.calculator.tracksPerAlbum()}

**H-Index**: ${await this.calculator.hIndex()}
**# of artists to equal 50% of scrobbles**: ${
          (await this.calculator.topPercent(50)).count
        }
**Total scrobbles for top 10 artists**: ${await this.calculator.sumTop(10)}
${perspective.upper.possessive} top 10 artists account for: ${bold(
          (await this.calculator.sumTopPercent(10)).asString
        )}% of ${perspective.possessivePronoun} total scrobbles

Among ${perspective.possessivePronoun} top ${displayNumber(
          (await this.calculator.totalArtists()).asNumber > 1000
            ? 1000
            : (await this.calculator.totalArtists()).asNumber,
          "artist"
        )}, ${perspective.plusToHave}...
        ${(await this.calculator.tierPlaysOver(this.playsoverTiers, 6))
          .map(
            (po) =>
              `**${displayNumber(po.count, "**artist")} with ${displayNumber(
                po.tier,
                "+ scrobble",
                true
              )}`
          )
          .join("\n")}` +
          ((await this.calculator.hasCrownStats()) &&
          this.humanizedPeriod === "overall"
            ? `\n\n**Total crowns**: ${rank!.count} (ranked ${italic(
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
              )}, ${perspective.plusToHave} a crown`
            : "") +
          `

${
  breadth
    ? `**Breadth rating**: ${breadth.rating.toFixed(1)} _(${
        breadth.ratingString
      })_\n`
    : ""
}**Number of unique tags**: ${(await this.calculator.uniqueTags()).toString()}`
      );

    await this.send(embed);
  }
}
