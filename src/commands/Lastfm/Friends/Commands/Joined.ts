import { FriendsChildCommand } from "../FriendsChildCommand";
import {
  FetchedResponses,
  MultiRequester,
} from "../../../../lib/MultiRequester";
import { dateDisplay } from "../../../../helpers";
import { FriendNotFoundError } from "../../../../errors";
import { fromUnixTime } from "date-fns";

export class Joined extends FriendsChildCommand {
  description = "View when your friends joined Last.fm";
  aliases = ["j"];
  usage = ["", "time period"];

  throwIfNoFriends = true;

  async run() {
    let joineds = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ])
      .fetch(this.lastFMService.userInfo.bind(this.lastFMService), {})
      .catch((e) => {
        console.log(e);
        throw new FriendNotFoundError();
      });

    let joinDates = Object.keys(joineds).reduce((acc, username) => {
      acc[username] = fromUnixTime(
        joineds[username].registered.unixtime.toInt()
      );

      return acc;
    }, {} as FetchedResponses<Date>);

    let embed = this.newEmbed()
      .setTitle(`Your friends' join dates`)
      .setDescription(
        Object.keys(joinDates)
          .sort((a, b) => joinDates[a].getTime() - joinDates[b].getTime())
          .map((username) => {
            let s = joinDates[username];

            return `${username.code()} - ${dateDisplay(s)}`;
          })
      );

    await this.send(embed);
  }
}
