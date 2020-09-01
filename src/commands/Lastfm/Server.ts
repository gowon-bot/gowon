import { MessageEmbed } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { MultiRequster } from "../../lib/MultiRequester";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Server extends LastFMBaseCommand {
  description = "Shows what the server is listening to";
  aliases = ["sfm"];
  usage = [""];
  arguments: Arguments = {};

  async run() {
    let users = await this.usersService.randomUser({
      limit: 10,
      serverID: this.message.guild?.id!,
    });

    let nowPlayings = await new MultiRequster(
      users.map((u) => u.lastFMUsername)
    ).fetch(this.lastFMService.nowPlayingParsed.bind(this.lastFMService), []);

    let embed = new MessageEmbed()
      .setTitle(`What's playing in the server?`)
      .setDescription(
        Object.keys(nowPlayings).map((username) => {
          let np = nowPlayings[username];

          return `${username.code()} - ${
            np.name
          } by ${np.artist.bold()} ${np.album ? `from ${np.album.italic()}` : ""}`;
        })
      );

    await this.send(embed);
  }
}
