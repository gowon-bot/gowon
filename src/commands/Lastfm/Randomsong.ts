import { buildRequestable } from "../../helpers/getMentions";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { Delegate } from "../../lib/command/BaseCommand";
import { LastFMBaseCommand } from "./LastFMBaseCommand";
import RandomsongInUsersLibrary from "./RandomSongInUsersLibrary";

const args = {
  mentions: standardMentions,
} as const;

export default class Randomsong extends LastFMBaseCommand<typeof args> {
  idSeed = "april naeun";
  subcategory = "fun";
  description = "Picks a random song from all the users in a guild";
  usage = [
    "",
    "@user (will pick a random song in their top tracks) poolAmount",
  ];

  arguments: Arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !!args.user || !!args.userID || !!args.lfmUser,
      delegateTo: RandomsongInUsersLibrary,
    },
  ];

  async run() {
    const serverUsers = (await this.guild.members.fetch()).map(
      (u) => `${u.id}`
    );

    const randomUser = await this.usersService.randomUser(this.ctx, {
      userIDs: serverUsers,
    });

    const randomSongs = await this.lastFMService.recentTracks(this.ctx, {
      username: buildRequestable(randomUser.lastFMUsername, randomUser)
        .requestable,
      limit: 100,
    });

    const randomSong =
      randomSongs.tracks[~~(randomSongs.tracks.length * Math.random())];

    const embed = this.newEmbed()
      .setAuthor(`Scrobbled by ${randomUser.lastFMUsername}`)
      .setTitle(randomSong.name)
      .setDescription(
        `by ${randomSong.artist.strong()}` +
          (randomSong.album ? ` from ${randomSong.album.italic()}` : "")
      )
      .setThumbnail(randomSong.images.get("large") || "");

    await this.send(embed);
  }
}
