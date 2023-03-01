import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { code } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { displayNumber } from "../../../../lib/views/displays";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class ArtistPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris EJ";

  description = "Shows how many plays of an artist your friends have";
  aliases = ["ap", "p"];
  usage = ["", "artist"];

  arguments = args;

  throwIfNoFriends = true;

  async run() {
    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      this.senderRequestable
    );

    const artistDetails = await new MultiRequester(this.ctx, [
      ...this.friendUsernames,
      this.senderRequestable,
    ]).fetch(this.lastFMService.artistInfo.bind(this.lastFMService), {
      artist,
    });

    if (!artistDetails) throw new LastFMEntityNotFoundError("artist");

    const artistName = Object.values(artistDetails).filter((v) => v?.name)[0]!
      .name;

    const embed = this.newEmbed()
      .setTitle(`Your friends plays of ${artistName}`)
      .setURL(LastfmLinks.listenersYouKnow(artistName))
      .setDescription(
        Object.keys(artistDetails)
          .sort(
            (a, b) =>
              (artistDetails[b]?.userPlaycount ?? -Infinity) -
              (artistDetails[a]?.userPlaycount ?? -Infinity)
          )
          .map((username) => {
            const ad = artistDetails[username];

            if (!ad || isNaN(ad.userPlaycount)) {
              return this.displayMissingFriend(username);
            }

            return `${code(username)} - **${displayNumber(
              ad.userPlaycount,
              "**scrobble"
            )}`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
