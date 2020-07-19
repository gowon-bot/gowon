import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { ucFirst, numberDisplay } from "../../helpers";

export class All extends OverviewChildCommand {
  description = "Shows information about a crown";

  async run(message: Message) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    await this.calculator.cacheAll();

    let image = (await this.calculator.userInfo()).image.find(
      (i) => i.size === "large"
    )?.["#text"]!;

    let userType = (await this.calculator.userInfo()).type;
    let badge =
      userType !== "user"
        ? userType === "subscriber"
          ? " [Pro]"
          : ` [${ucFirst(userType)}]`
        : "";

    let colour =
      userType === "mod"
        ? "#fb9904"
        : userType === "staff"
        ? "#b90100"
        : userType === "subscriber"
        ? "black"
        : "#ffffff";

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `
_Scrobbling since ${await this.calculator.joined()}_

**Scrobbles**: ${await this.calculator.totalScrobbles()} (_${await this.calculator.avgPerDay()}/day_)
**Artists**: ${await this.calculator.totalArtists()} (_${await this.calculator.avgScrobblesPerArtist()} scrobbles/artist_)
**Albums**: ${await this.calculator.totalAlbums()} (_${await this.calculator.avgScrobblesPerAlbum()} scrobbles/album_)
**Tracks**: ${await this.calculator.totalTracks()} (_${await this.calculator.avgScrobblesPerTrack()} scrobbles/track_)

**Albums per artist**: ${await this.calculator.albumsPerArtist()}
**Tracks per artist**: ${await this.calculator.tracksPerArtist()}
**Tracks per album**: ${await this.calculator.tracksPerAlbum()}

**H-Index**: ${await this.calculator.hIndex()}
**# of artists to equal 50% of scrobbles**: ${await this.calculator.top50Percent()}
**Total scrobbles for top 10 artists**: ${await this.calculator.sumTop(10)}
${ucFirst(perspective.possessive)} top 10 artists account for: ${(
          await this.calculator.sumTopPercent(10)
        ).bold()}% of ${perspective.possesivePronoun} total scrobbles

Among ${perspective.possesivePronoun} top 1000 artists, ${
          perspective.plusToHave
        }...
    - ${(
      await this.calculator.playsOver(1000)
    ).bold()} artists with 1000+ scrobbles
    - ${(
      await this.calculator.playsOver(500)
    ).bold()} artists with 500+ scrobbles
    - ${(
      await this.calculator.playsOver(250)
    ).bold()} artists with 250+ scrobbles
    - ${(
      await this.calculator.playsOver(100)
    ).bold()} artists with 100+ scrobbles

**Total crowns**: ${await this.calculator.totalCrowns()}

For every ${numberDisplay(
          await this.calculator.artistsPerCrown(),
          "eligible artist"
        ).bold()}, ${perspective.plusToHave} a crown
For every ${numberDisplay(
          await this.calculator.scrobblesPerCrown(),
          "scrobble"
        ).bold()}, ${perspective.plusToHave} a crown
`
      );

    await message.channel.send(embed);
  }
}

// Username: flushed_emoji (scrobbling since 7 Jul 2019)
// Country: Canada
// Scrobbles: 44474 | Avg/Day: 117.73
// Artists: 2244 | Avg/Artist: 19.82
// Albums: 3967 | Avg/Album: 11.21
// Tracks: 6431 | Avg/Track: 6.92

// Albums per artist: 1.77
// Tracks per artist: 2.87
// Tracks per album: 1.62

// H-Index: 86
// # of artists to equal 50% of scrobbles: Top 73
// Total scrobbles for top 10 artists: 9441
// flushed_emoji's top 10 artists account for 21.23% of their total scrobbles.

// Among their top 1000 artists, flushed_emoji has...
// - 3 artists with 1000+ scrobbles
// - 7 artists with 500+ scrobbles
// - 28 artists with 250+ scrobbles
// - 74 artists with 100+ scrobbles

// Total Crowns: 65 (Ranked #120)
// flushed_emoji has 297 artists with 30+ plays in their top 1000 artists.
