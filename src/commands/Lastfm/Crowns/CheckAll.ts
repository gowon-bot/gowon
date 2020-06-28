import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";

export class CheckAll extends CrownsChildCommand {
  description = "Checks all crowns";
  secretCommand = true;

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists(username, 1000);

    await Promise.all(
      topArtists.artist.map((a) =>
        this.crownsService.checkCrown({
          serverID: message.guild?.id!,
          discordID: message.author.id,
          artistName: a.name,
          plays: parseInt(a.playcount, 10),
        })
      )
    );

    await message.reply("Done.");
  }
}
