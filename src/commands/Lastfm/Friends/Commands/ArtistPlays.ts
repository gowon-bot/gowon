import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { MultiRequester } from "../../../../lib/MultiRequester";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class ArtistPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris EJ";

  description = "Shows how many plays of an artist your friends have";
  aliases = [
    "ap",
    "p",
    "friendswhoknows",
    "friendswhoknowsartist",
    "fwk",
    "whoknowsartist",
    "wka",
  ];
  usage = ["", "artist"];

  arguments = args;

  async run() {
    const { senderRequestable, friends } = await this.getMentions({
      fetchFriendsList: true,
      friendsRequired: true,
    });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const artistDetails = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.artistInfo.bind(this.lastFMService), {
      artist,
    });

    if (!artistDetails) {
      throw new LastFMEntityNotFoundError("artist");
    }

    const artistName = Object.values(artistDetails).filter((v) => v?.name)[0]!
      .name;

    const friendDisplays = friends
      .sortBy((f) => artistDetails[f.getUsername()]?.userPlaycount ?? -Infinity)
      .map((f) => {
        const ad = artistDetails[f.getUsername()];

        if (!ad || isNaN(ad.userPlaycount)) {
          return this.displayMissingFriend(f.getUsername());
        }

        return `${f.display()} - **${displayNumber(
          ad.userPlaycount,
          "**scrobble"
        )}`;
      });

    const totalPlays = Object.values(artistDetails).reduce(
      (acc, ad) => acc + (ad?.userPlaycount ?? 0),
      0
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends artist plays"))
      .setTitle(`Your friends plays of ${artistName}`)
      .setURL(LastfmLinks.listenersYouKnow(artistName))
      .setDescription(displayNumberedList(friendDisplays))
      .setFooter({
        text: `Your friends have a total of ${displayNumber(
          totalPlays,
          "scrobble"
        )} of this artist`,
      });

    await this.send(embed);
  }
}
