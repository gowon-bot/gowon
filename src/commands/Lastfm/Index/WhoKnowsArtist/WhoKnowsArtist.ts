import { MessageEmbed } from "discord.js";
import { IndexerError } from "../../../../errors";
import { numberDisplay } from "../../../../helpers";
import { displayLink } from "../../../../helpers/discord";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
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
  secretCommand = true;

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    let artistName = this.parsedArguments.artist;

    let { senderUsername } = await this.parseMentions({
      senderRequired: !artistName,
    });

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    } else {
      const lfmArtist = await this.lastFMConverter.artistInfo({
        artist: artistName,
      });

      artistName = lfmArtist.name;
    }

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(senderUsername);
    }

    const response = await this.query({
      artist: { name: artistName },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { rows, artist } = response.whoKnowsArtist;

    const embed = new MessageEmbed()
      .setTitle(`Who knows ${artist.name.strong()}?`)
      .setDescription(
        !artist || rows.length === 0
          ? `No one knows this artist`
          : rows.map(
              (wk, index) =>
                `${index + 1}. ${displayLink(
                  wk.user.username,
                  LinkGenerator.userPage(wk.user.username)
                )} - **${numberDisplay(wk.playcount, "**play")}`
            )
      );

    await this.send(embed);
  }
}
