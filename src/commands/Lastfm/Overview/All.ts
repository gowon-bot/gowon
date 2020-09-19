import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";
import { numberDisplay, getOrdinal } from "../../../helpers";

export class All extends OverviewChildCommand {
  description = "Shows information about you and your library";

  async run() {
    let perspective = this.usersService.perspective(
      this.senderUsername,
      this.username
    );

    await this.calculator.cacheAll();

    let { colour, badge, image } = await this.getAuthorDetails();

    let rank = await this.calculator.crownsRank();
    let breadth: { rating: number; ratingString: string } | undefined;
    try {
      breadth = await this.calculator.breadth();
    } catch {}

    let embed = new MessageEmbed()
      .setAuthor(this.username + badge, image)
      .setColor(colour)
      .setDescription(
        `
${
  this.client.isAuthor(this.discordID)
    ? "<:typescript:746450416635609199> _Author_\n"
    : this.client.isGowon(this.discordID)
    ? "<:gowonswag2:754923498786521088> _Gowon_\n"
    : this.client.isAlphaTester(this.discordID)
    ? ":sunglasses: _Alpha tester_\n"
    : ""
}
_Scrobbling since ${await this.calculator.joined()}_

**Scrobbles**: ${await this.calculator.totalScrobbles()} (_${await this.calculator.avgPerDay()}/day_)
**Artists**: ${await this.calculator.totalArtists()} (_${await this.calculator.avgScrobblesPerArtist()} scrobbles/artist_)
**Albums**: ${await this.calculator.totalAlbums()} (_${await this.calculator.avgScrobblesPerAlbum()} scrobbles/album_)
**Tracks**: ${await this.calculator.totalTracks()} (_${await this.calculator.avgScrobblesPerTrack()} scrobbles/track_)

**Albums per artist**: ${await this.calculator.albumsPerArtist()}
**Tracks per artist**: ${await this.calculator.tracksPerArtist()}
**Tracks per album**: ${await this.calculator.tracksPerAlbum()}

**H-Index**: ${await this.calculator.hIndex()}
${
  breadth
    ? `**Breadth rating**: ${breadth.rating.toFixed(1)} _(${
        breadth.ratingString
      })_`
    : ""
}
**# of artists to equal 50% of scrobbles**: ${await (
          await this.calculator.top50Percent()
        ).count}
**Total scrobbles for top 10 artists**: ${await this.calculator.sumTop(10)}
${perspective.upper.possessive} top 10 artists account for: ${(
          await this.calculator.sumTopPercent(10)
        ).asString.bold()}% of ${perspective.possessivePronoun} total scrobbles

Among ${perspective.possessivePronoun} top 1000 artists, ${
          perspective.plusToHave
        }...
    - ${(
      await this.calculator.playsOver(1000)
    ).asString.bold()} artists with 1000+ scrobbles
    - ${(
      await this.calculator.playsOver(500)
    ).asString.bold()} artists with 500+ scrobbles
    - ${(
      await this.calculator.playsOver(250)
    ).asString.bold()} artists with 250+ scrobbles
    - ${(
      await this.calculator.playsOver(100)
    ).asString.bold()} artists with 100+ scrobbles
    - ${(
      await this.calculator.playsOver(50)
    ).asString.bold()} artists with 50+ scrobbles` +
          ((await this.calculator.hasCrownStats())
            ? `\n\n**Total crowns**: ${rank!.count} (${getOrdinal(
                rank!.rank.toInt()
              ).italic()})
For every ${numberDisplay(
                (await this.calculator.artistsPerCrown())!.asString,
                "eligible artist"
              ).bold()}, ${perspective.plusToHave} a crown
For every ${numberDisplay(
                (await this.calculator.scrobblesPerCrown())!.asString,
                "scrobble"
              ).bold()}, ${perspective.plusToHave} a crown
`
            : "")
      );

    await this.send(embed);
  }
}
