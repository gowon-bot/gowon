import {
  FetchedResponses,
  MultiRequester,
} from "../../../../lib/MultiRequester";
import {
  displayDate,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { FriendsChildCommand } from "../FriendsChildCommand";

export class Joined extends FriendsChildCommand {
  idSeed = "elris chaejeong";

  description = "Shows when your friends joined Last.fm";
  aliases = ["j"];
  usage = ["", "time period"];

  async run() {
    const { friends } = await this.getMentions({
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const joineds = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.userInfo.bind(this.lastFMService), {});

    const joinDates = Object.keys(joineds).reduce((acc, username) => {
      acc[username] = joineds[username]?.registeredAt;

      return acc;
    }, {} as FetchedResponses<Date>);

    const friendDisplays = friends
      .sortBy((f) => joinDates[f.getUsername()]!.getTime() || Infinity)
      .map((f) => {
        const s = joinDates[f.getUsername()];

        if (!s || s?.getTime() === 0) {
          return this.displayMissingFriend(f.getUsername(), "join date");
        }

        return `${f.display()} - ${displayDate(s)}`;
      });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends joined"))
      .setTitle(`Your friends' join dates`)
      .setDescription(displayNumberedList(friendDisplays));

    await this.send(embed);
  }
}
