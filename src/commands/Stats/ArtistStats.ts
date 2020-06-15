import { BaseCommand } from "../../BaseCommand";
import { Message, MessageEmbed, User } from "discord.js";
import { Arguments } from "../../arguments";
import { calculatePercent } from "../../helpers/stats";

export default class ArtistStats extends BaseCommand {
  aliases = ["astats", "as"];
  description = "Display some stats about an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
    mentions: {
      0: { name: "user", description: "The user to generate stats for" },
    },
  };

  async run(message: Message) {
    let artistName = this.parsedArguments.artist as string,
      user = this.parsedArguments.user as User;

    let senderUsername = await this.usersService.getUsername(message.author.id);
    let mentionedUsername = user && await this.usersService.getUsername(user?.id);

    let username = mentionedUsername || senderUsername;

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let [artist, userInfo] = await Promise.all([
      this.lastFMService.artistInfo(artistName, username),
      this.lastFMService.userInfo(username),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(`Artist stats for ${username}`)
      .setTitle(artist.name)
      .addField(
        "Global stats",
        `\`${artist.stats.listeners}\` listeners
\`${artist.stats.playcount}\` total plays
\`${artist.stats.userplaycount}\` plays by you
That means you account for ${calculatePercent(
          artist.stats.userplaycount,
          artist.stats.playcount
        )}% of all ${artist.name} scrobbles!`
      )
      .addField(
        "Your stats",
        `${calculatePercent(
          artist.stats.userplaycount,
          userInfo.playcount
        )}% of your total scrobbles`
      );

    message.channel.send(embed);
  }
}
