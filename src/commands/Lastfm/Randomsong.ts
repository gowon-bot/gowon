import { MessageEmbed } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { Delegate } from "../../lib/command/BaseCommand";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import RandomsongInUsersLibrary from "./RandomSongInUsersLibrary";

export default class Randomsong extends LastFMBaseCommand {
  description = "Picks a random song";
  usage = "";

  arguments: Arguments = {
    mentions: standardMentions
  };

  delegates: Delegate[] = [
    {
      when: (args) => !!args.user || !!args.userID || !!args.lfmUser,
      delegateTo: RandomsongInUsersLibrary,
    },
  ];

  async run() {
    let randomUser = await this.usersService.randomUser();

    let randomSongs = await this.lastFMService.recentTracks({
      username: randomUser.lastFMUsername,
      limit: 100,
    });

    let randomSong =
      randomSongs.track[~~(randomSongs.track.length * Math.random())];

    let embed = new MessageEmbed()
      .setAuthor(`Scrobbled by ${randomUser.lastFMUsername}`)
      .setTitle(randomSong.name)
      .setDescription(
        `by ${randomSong.artist["#text"].bold()}` +
          (randomSong.album["#text"]
            ? ` from ${randomSong.album["#text"].italic()}`
            : "")
      )
      .setThumbnail(
        randomSong.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await this.send(embed);
  }
}
