import { FriendsChildCommand } from "../FriendsChildCommand";
import {
  FetchedResponses,
  MultiRequester,
} from "../../../../lib/MultiRequester";
import { dateDisplay } from "../../../../helpers";
import { fromUnixTime } from "date-fns";

export class Joined extends FriendsChildCommand {
  idSeed = "elris chaejeong";

  description = "Shows when your friends joined Last.fm";
  aliases = ["j"];
  usage = ["", "time period"];

  throwIfNoFriends = true;

  async run() {
    let joineds = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ]).fetch(this.lastFMService.userInfo.bind(this.lastFMService), {});

    let joinDates = Object.keys(joineds).reduce((acc, username) => {
      acc[username] = fromUnixTime(
        joineds[username]?.registered.unixtime.toInt() || 0
      );

      return acc;
    }, {} as FetchedResponses<Date>);

    let embed = this.newEmbed()
      .setTitle(`Your friends' join dates`)
      .setDescription(
        Object.keys(joinDates)
          .sort(
            (a, b) =>
              (joinDates[a]?.getTime() === 0
                ? Infinity
                : joinDates[a]!.getTime()) -
              (joinDates[b]?.getTime() === 0
                ? Infinity
                : joinDates[b]!.getTime())
          )
          .map((username) => {
            let s = joinDates[username];

            if (!s || s?.getTime() === 0)
              return this.displayMissingFriend(username, "join date");

            return `${username.code()} - ${dateDisplay(s)}`;
          })
      );

    await this.send(embed);
  }
}
