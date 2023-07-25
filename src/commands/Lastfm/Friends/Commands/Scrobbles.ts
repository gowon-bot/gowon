import { MultiRequester } from "../../../../lib/MultiRequester";
import { DateRangeArgument } from "../../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { DateRange } from "../../../../lib/timeAndDate/DateRange";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  dateRange: new DateRangeArgument({
    useOverall: true,
    default: () => DateRange.overall(),
  }),
} satisfies ArgumentsMap;

export class Scrobbles extends FriendsChildCommand<typeof args> {
  idSeed = "nature sohee";

  description = "Shows how many scrobbles your friends have";
  aliases = ["s"];
  usage = ["", "time period"];

  arguments = args;

  async run() {
    const { friends } = await this.getMentions({
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const dateRange = this.parsedArguments.dateRange;

    const scrobbles = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.getNumberScrobbles.bind(this.lastFMService), [
      dateRange.from,
      dateRange.to,
    ]);

    const friendDisplays = friends
      .sortBy((f) => scrobbles[f.getUsername()] ?? -Infinity)
      .map((f) => {
        const s = scrobbles[f.getUsername()];

        if (!s) {
          return this.displayMissingFriend(f.getUsername(), "scrobble count");
        }

        return `${f.display()} - **${displayNumber(s, "**scrobble")}`;
      });

    const totalScrobbles = Object.values(scrobbles).reduce(
      (acc: number, s) => acc + (s || 0),
      0
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends scrobbles"))
      .setTitle(`Your friends scrobbles ${dateRange.humanized()}`)
      .setDescription(displayNumberedList(friendDisplays))
      .setFooter({
        text: `Your friends have a total of ${displayNumber(
          totalScrobbles,
          "scrobble"
        )}`,
      });

    await this.send(embed);
  }
}
