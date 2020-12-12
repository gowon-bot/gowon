import { OverviewChildCommand } from "./OverviewChildCommand";
import { numberDisplay, getOrdinal } from "../../../helpers";
import { Emoji } from "../../../lib/Emoji";
import { LinkGenerator } from "../../../helpers/lastFM";

export class All extends OverviewChildCommand {
  idSeed = "fx victoria";

  description = "Shows information about you and your library";

  showLoadingAfter = 5;

  async run() {
    let perspective = this.usersService.perspective(
      this.senderUsername,
      this.username
    );

    let [friends] = await Promise.all([
      this.lastFMService.userGetFriends({ username: this.username, limit: 1 }),
      await this.calculator.cacheAll(),
    ]);

    let { colour, badge, image } = await this.getAuthorDetails();

    let rank = await this.calculator.crownsRank();
    let breadth: { rating: number; ratingString: string } | undefined;
    try {
      breadth = await this.calculator.breadth();
    } catch {}

    let embed = this.newEmbed()
      .setAuthor(
        this.username + badge,
        image,
        LinkGenerator.userPage(this.username)
      )
      .setThumbnail(image)
      .setColor(colour)
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
    : this.gowonClient.isAlphaTester(this.discordID)
    ? `${Emoji.gowonheart} _Alpha tester_\n`
    : ""
}
_Scrobbling since ${await this.calculator.joined()}_
_Following ${numberDisplay(friends["@attr"].total, "user")}_

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
${perspective.upper.possessive} top 10 artists account for: ${(
          await this.calculator.sumTopPercent(10)
        ).asString.strong()}% of ${
          perspective.possessivePronoun
        } total scrobbles

Among ${perspective.possessivePronoun} top ${numberDisplay(
          (await this.calculator.totalArtists()).asNumber > 1000
            ? 1000
            : (await this.calculator.totalArtists()).asNumber,
          "artist"
        )}, ${perspective.plusToHave}...
        ${(await this.calculator.tierPlaysOver(this.playsoverTiers, 6))
          .map(
            (po) =>
              `**${numberDisplay(po.count, "**artist")} with ${numberDisplay(
                po.tier,
                "+ scrobble",
                true
              )}`
          )
          .join("\n")}` +
          ((await this.calculator.hasCrownStats())
            ? `\n\n**Total crowns**: ${rank!.count} (ranked ${getOrdinal(
                rank!.rank.toInt()
              ).italic()})
For every ${numberDisplay(
                (await this.calculator.artistsPerCrown())!.asString,
                "eligible artist"
              ).strong()}, ${perspective.plusToHave} a crown
For every ${numberDisplay(
                (await this.calculator.scrobblesPerCrown())!.asString,
                "scrobble"
              ).strong()}, ${perspective.plusToHave} a crown`
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
