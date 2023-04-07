import gql from "graphql-tag";
import { FriendsHaveNoScrobblesOfArtistError } from "../../../../errors/friends";
import { bold } from "../../../../helpers/discord";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import {
  displayDate,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { MirrorballUser } from "../../../../services/mirrorball/MirrorballTypes";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class WhoFirstArtist extends FriendsChildCommand<typeof args> {
  idSeed = "billlie haram";

  description = "Shows when your friends first scrobbled an artist";
  aliases = ["wf", "wfa"];
  usage = ["", "artist | album"];

  arguments = args;

  async run() {
    const { senderRequestable, friends } = await this.getMentions({
      senderRequired: true,
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const query = gql`
      query friendsWhoFirst(
        $artist: ArtistInput!
        $settings: WhoKnowsSettings
      ) {
        whoFirstArtist(artist: $artist, settings: $settings) {
          artist {
            name
          }

          rows {
            user {
              username
              discordID
              privacy
            }
            scrobbledAt
          }
        }
      }
    `;

    const whoFirst = (await this.mirrorballService.query(this.ctx, query, {
      artist: { name: artist },
      settings: { userIDs: friends.discordIDs() },
    })) as {
      whoFirstArtist: {
        artist: {
          name: string;
        };
        rows: {
          user: MirrorballUser;
          scrobbledAt: number;
        }[];
      };
    };

    if (!whoFirst.whoFirstArtist.rows.length) {
      throw new FriendsHaveNoScrobblesOfArtistError();
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friends who first"))
      .setTitle(
        `When your friends first scrobbled ${bold(
          whoFirst.whoFirstArtist.artist.name
        )}`
      )
      .setDescription(
        displayNumberedList(
          whoFirst.whoFirstArtist.rows.map(
            (wk) =>
              `${friends
                .getFriend(wk.user.discordID)
                .display()} - ${displayDate(
                convertMirrorballDate(wk.scrobbledAt)
              )}`
          )
        )
      );

    await this.send(embed);
  }
}
