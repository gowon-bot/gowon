import { MirrorballError } from "../../../../errors";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { CrownsService } from "../../../../services/dbservices/CrownsService";
import { NicknameService } from "../../../../services/guilds/NicknameService";
import {
  WhoKnowsArtistConnector,
  WhoKnowsArtistParams,
  WhoKnowsArtistResponse,
} from "./WhoKnowsArtist.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export default class WhoKnowsArtist extends MirrorballBaseCommand<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams,
  typeof args
> {
  connector = new WhoKnowsArtistConnector();

  idSeed = "bvndit songhee";

  aliases = ["wk", "fmwk"];

  variations: Variation[] = [{ name: "update", variation: "uwk" }];

  description = "See who knows an artist";

  subcategory = "whoknows";
  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  nicknameService = new NicknameService(this.logger);
  crownsService = new CrownsService(this.logger);

  async run() {
    const { senderRequestable } = await this.parseMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const artistName = await this.lastFMArguments.getArtist(
      senderRequestable,
      true
    );

    const crown = await this.crownsService.getCrown(artistName, this.guild.id);

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      artist: { name: artistName },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    await this.nicknameService.cacheNicknames(
      response.whoKnowsArtist.rows.map((u) => u.user),
      this.guild.id,
      this.gowonClient
    );

    const { rows, artist } = response.whoKnowsArtist;

    const embed = this.newEmbed()
      .setTitle(`Who knows ${artist.name.strong()}?`)
      .setDescription(
        !artist || rows.length === 0
          ? `No one knows this artist`
          : displayNumberedList(
              rows.map(
                (wk) =>
                  `${displayLink(
                    this.nicknameService.cacheGetNickname(wk.user.discordID),
                    LinkGenerator.userPage(wk.user.username)
                  )} - **${displayNumber(wk.playcount, "**play")}${
                    crown?.user?.discordID === wk.user.discordID ? " 👑" : ""
                  }`
              )
            )
      );

    await this.send(embed);
  }
}
