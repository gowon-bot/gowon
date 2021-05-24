import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  humanizedTimeRangeParser,
  timeRangeParser,
} from "../../../../helpers/date";
import { displayNumber } from "../../../../lib/views/displays";

const args = {
  inputs: {
    timeRange: { custom: timeRangeParser(), index: -1 },
    humanizedTimeRange: { custom: humanizedTimeRangeParser(), index: -1 },
  },
} as const;

export class Scrobbles extends FriendsChildCommand<typeof args> {
  idSeed = "nature sohee";

  description = "Shows how many scrobbles your friends have";
  aliases = ["s"];
  usage = ["", "time period"];

  arguments: Arguments = args;

  throwIfNoFriends = true;

  async run() {
    let timeRange = this.parsedArguments.timeRange!,
      humanTimeRange = this.parsedArguments.humanizedTimeRange!;

    let scrobbles = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ]).fetch(this.lastFMService.getNumberScrobbles.bind(this.lastFMService), [
      timeRange.from,
      timeRange.to,
    ]);

    let embed = this.newEmbed()
      .setTitle(`Your friends scrobbles ${humanTimeRange}`)
      .setDescription(
        Object.keys(scrobbles)
          .sort(
            (a, b) => (scrobbles[b] ?? -Infinity) - (scrobbles[a] ?? -Infinity)
          )
          .map((username) => {
            let s = scrobbles[username];

            if (!s)
              return this.displayMissingFriend(username, "scrobble count");

            return `${username.code()} - **${displayNumber(s, "**scrobble")}`;
          })
      );

    await this.send(embed);
  }
}
