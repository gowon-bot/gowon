import { FriendsChildCommand } from "../FriendsChildCommand";
import { Arguments } from "../../../../lib/arguments/arguments";
import gql from "graphql-tag";
import {
  displayDate,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { LogicError } from "../../../../errors";
import { MirrorballUser } from "../../../../services/mirrorball/MirrorballTypes";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class WhoFirstArtist extends FriendsChildCommand<typeof args> {
  idSeed = "billlie haram";

  description = "Shows when your friends first scrobbled an artist";
  aliases = ["wf", "wfa"];
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  throwIfNoFriends = true;

  async run() {
    const { senderUser } = await this.parseMentions({
      senderRequired: true,
    });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      this.senderRequestable
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

    const friends = await this.friendsService.listFriends(
      this.ctx,
      senderUser!
    );

    const friendIDs = [
      ...(friends.map((f) => f.friend?.discordID).filter((f) => !!f) || []),
      this.author.id,
    ];

    const whoFirst = (await this.mirrorballService.query(this.ctx, query, {
      artist: { name: artist },
      settings: { userIDs: friendIDs },
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
      throw new LogicError(
        `Neither you nor your friends have scrobbled this artist!`
      );
    }

    const embed = this.newEmbed()
      .setTitle(`When your friends first scrobbled ${artist.strong()}`)
      .setDescription(
        displayNumberedList(
          whoFirst.whoFirstArtist.rows.map(
            (wk) =>
              `${wk.user.username.code()} - ${displayDate(
                convertMirrorballDate(wk.scrobbledAt)
              )}`
          )
        )
      );

    await this.send(embed);
  }
}
