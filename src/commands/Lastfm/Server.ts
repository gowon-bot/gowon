import { MultiRequester } from "../../lib/MultiRequester";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Server extends LastFMBaseCommand {
  description = "Shows what the server is listening to";
  aliases = ["sfm"];
  usage = [""];

  async run() {
    let serverUsers = await this.serverUserIDs();

    let users = await this.usersService.randomUser({
      limit: 10,
      userIDs: serverUsers,
    });

    let nowPlayings = await new MultiRequester(
      users.map((u) => u.lastFMUsername)
    ).fetch(this.lastFMService.nowPlayingParsed.bind(this.lastFMService), []);

    let embed = this.newEmbed()
      .setTitle("Random songs across the server")
      .setDescription(
        Object.keys(nowPlayings)
          .sort((k) => (nowPlayings[k].nowPlaying ? 1 : 0))
          .map((username) => {
            let np = nowPlayings[username];

            return `${username.code()} - ${np.name} by ${np.artist.strong()} ${
              np.album ? `from ${np.album.italic()}` : ""
            } ${np.nowPlaying ? "_(listening now)_" : ""}`;
          })
      );

    await this.send(embed);
  }
}
