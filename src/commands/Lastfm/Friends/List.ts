import { differenceInMilliseconds, intervalToDuration } from "date-fns";
import { bold, italic } from "../../../helpers/discord";
import { emDash } from "../../../helpers/specialCharacters";
import { MultiRequester } from "../../../lib/MultiRequester";
import { humanizeDuration } from "../../../lib/timeAndDate/helpers/humanize";
import { displayIconList, displayNumber } from "../../../lib/views/displays";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { FriendsChildCommand } from "./FriendsChildCommand";

export class List extends FriendsChildCommand {
  idSeed = "nature chaebin";

  aliases = ["fm", "np", "nowplaying"];
  description = "Shows what your friends are listening to";
  usage = "";

  async run() {
    const { senderUser, friends } = await this.getMentions({
      senderRequired: true,
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const nowPlayings = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.nowPlaying.bind(this.lastFMService), []);

    const numberOfFriends = await this.friendsService.friendsCount(
      this.ctx,
      senderUser!
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends list"))
      .setTitle(
        `${displayNumber(numberOfFriends, "friend")} for ${
          this.author.username
        }`
      )
      .setDescription(
        displayIconList(
          friends.sortedList(),
          (f) => {
            const np = nowPlayings[f.getUsername()];

            if (!np) return "";

            return np.isNowPlaying ? "np" : this.displayDuration(np);
          },
          (f) => {
            const username = f.getUsername();
            const np = nowPlayings[username];

            if (!np || !np?.name) {
              return this.displayMissingFriend(username, "current track");
            }

            return `${f.display()} ${emDash} ${italic(np.name)} by ${bold(
              np.artist
            )}`;
          }
        )
      );

    await this.send(embed);
  }

  private displayDuration(np: RecentTrack): string {
    const difference = differenceInMilliseconds(new Date(), np.scrobbledAt);

    const duration = intervalToDuration({ start: 0, end: difference });

    const time = humanizeDuration(duration);

    const splits = time.split("and")[0].split(" ");

    return splits[0] + splits[1][0];
  }
}
