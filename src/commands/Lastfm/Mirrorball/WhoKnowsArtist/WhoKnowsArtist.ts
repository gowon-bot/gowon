import { IndexerError } from "../../../../errors";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../../lib/views/displays";
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

export default class WhoKnowsArtist extends IndexingBaseCommand<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams,
  typeof args
> {
  connector = new WhoKnowsArtistConnector();

  idSeed = "bvndit songhee";

  aliases = ["wk"];

  variations: Variation[] = [{ name: "update", variation: "uwk" }];

  description = "See who knows an artist";

  subcategory = "whoknows";
  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  nicknameService = new NicknameService(this.logger);

  async run() {
    let artistName = this.parsedArguments.artist;

    let { senderRequestable } = await this.parseMentions({
      senderRequired: !artistName,
    });

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlaying(senderRequestable))
        .artist;
    } else {
      const lfmArtist = await this.lastFMService.artistInfo({
        artist: artistName,
      });

      artistName = lfmArtist.name;
    }

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      artist: { name: artistName },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
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
                  )} - **${displayNumber(wk.playcount, "**play")}`
              )
            )
      );

    await this.send(embed);
  }
}
