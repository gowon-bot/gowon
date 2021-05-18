import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";
import { LinkGenerator, toInt } from "../../../../helpers/lastFM";
import { LastFMEntityNotFoundError } from "../../../../errors";

const args = {
  inputs: {
    artist: {
      index: {
        start: 0,
      },
    },
  },
} as const;

export class ArtistPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris EJ";

  description = "Shows how many plays of an artist your friends have";
  aliases = ["ap", "p"];
  usage = ["", "artist"];

  arguments: Arguments = args;

  throwIfNoFriends = true;

  async run() {
    let artist = this.parsedArguments.artist;

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(this.senderUsername))
        .artist;
    }

    let artistDetails = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ]).fetch(this.lastFMService.artistInfo.bind(this.lastFMService), {
      artist,
    });

    if (!artistDetails) throw new LastFMEntityNotFoundError("artist");

    let artistName = Object.values(artistDetails).filter((v) => v?.name)[0]!
      .name;

    let embed = this.newEmbed()
      .setTitle(`Your friends plays of ${artistName}`)
      .setURL(LinkGenerator.listenersYouKnow(artistName))
      .setDescription(
        Object.keys(artistDetails)
          .sort(
            (a, b) =>
              (toInt(artistDetails[b]?.stats?.userplaycount) ?? -Infinity) -
              (toInt(artistDetails[a]?.stats?.userplaycount) ?? -Infinity)
          )
          .map((username) => {
            let ad = artistDetails[username];

            if (!ad?.stats.userplaycount)
              return this.displayMissingFriend(username);

            return `${username.code()} - **${numberDisplay(
              ad.stats.userplaycount,
              "**scrobble"
            )}`;
          })
      );

    await this.send(embed);
  }
}
