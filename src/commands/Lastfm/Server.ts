import { bold, code, italic } from "../../helpers/discord";
import { MultiRequester } from "../../lib/MultiRequester";
import { buildRequestable } from "../../services/arguments/mentions/MentionsBuilder";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Server extends LastFMBaseCommand {
  idSeed = "april rachel";

  subcategory = "nowplaying";
  description = "Shows what the server is listening to";
  aliases = ["sfm"];
  usage = [""];

  slashCommand = true;
  guildRequired = true;

  async run() {
    const serverUsers = await this.serverUserIDs();

    const users = await this.usersService.randomUser(this.ctx, {
      limit: 10,
      userIDs: serverUsers,
    });

    const nowPlayings = await new MultiRequester(
      this.ctx,
      users.map((u) => buildRequestable(u.lastFMUsername, u).requestable)
    ).fetch(this.lastFMService.nowPlaying.bind(this.lastFMService), []);

    const embed = this.newEmbed()
      .setTitle("Random songs across the server")
      .setDescription(
        Object.keys(nowPlayings)
          .filter((k) => nowPlayings[k] && nowPlayings[k]?.name)
          .sort((k) => (nowPlayings[k]!.isNowPlaying ? 1 : 0))
          .map((username) => {
            const np = nowPlayings[username]!;

            return `${code(username)} - ${np.name} by ${bold(np.artist)} ${
              np.album ? `from ${italic(np.album)}` : ""
            } ${np.isNowPlaying ? "_(listening now)_" : ""}`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
