import { MirrorballError } from "../../../../errors";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  displayDate,
  displayLink,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { NicknameService } from "../../../../services/guilds/NicknameService";
import {
  WhoFirstArtistConnector,
  WhoFirstArtistParams,
  WhoFirstArtistResponse,
} from "./connectors";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export default class WhoFirstArtist extends MirrorballBaseCommand<
  WhoFirstArtistResponse,
  WhoFirstArtistParams,
  typeof args
> {
  connector = new WhoFirstArtistConnector();

  idSeed = "shasha garam";

  aliases = ["wf"];

  variations: Variation[] = [
    {
      name: "wholast",
      variation: ["wholastartist", "wl"],
      description: "Shows who *last* scrobbled an artist",
    },
  ];

  description = "See who first scrobbled an artist";

  subcategory = "whofirst";
  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  nicknameService = new NicknameService(this.logger);

  async run() {
    const whoLast = this.variationWasUsed("wholast");

    let { senderRequestable } = await this.parseMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const artistName = await this.lastFMArguments.getArtist(
      senderRequestable,
      true
    );

    const response = await this.query({
      whoLast,
      artist: { name: artistName },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    await this.nicknameService.cacheNicknames(
      response.whoFirstArtist.rows.map((u) => u.user),
      this.guild.id,
      this.gowonClient
    );

    const { rows, artist } = response.whoFirstArtist;

    const embed = this.newEmbed()
      .setTitle(
        `Who ${whoLast ? "last" : "first"} scrobbled ${artist.name.strong()}?`
      )
      .setDescription(
        !artist || rows.length === 0
          ? `No one has scrobbled this artist`
          : displayNumberedList(
              rows.map(
                (wk) =>
                  `${displayLink(
                    this.nicknameService.cacheGetNickname(wk.user.discordID),
                    LinkGenerator.userPage(wk.user.username)
                  )} - ${displayDate(convertMirrorballDate(wk.scrobbledAt))}`
              )
            )
      );

    await this.send(embed);
  }
}
