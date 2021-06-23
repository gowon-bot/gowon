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
  WhoKnowsTrackConnector,
  WhoKnowsTrackParams,
  WhoKnowsTrackResponse,
} from "./WhoKnowsTrack.connector";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
} as const;

export default class WhoKnowsTrack extends IndexingBaseCommand<
  WhoKnowsTrackResponse,
  WhoKnowsTrackParams,
  typeof args
> {
  connector = new WhoKnowsTrackConnector();

  idSeed = "redsquare lina";

  aliases = ["wkt"];
  subcategory = "whoknows";
  rollout = {
    guilds: this.indexerGuilds,
  };

  variations: Variation[] = [{ name: "update", variation: "uwkt" }];

  description = "See who knows a track";

  arguments: Arguments = args;

  nicknameService = new NicknameService(this.logger);

  async run() {
    let artistName = this.parsedArguments.artist,
      trackName = this.parsedArguments.track;

    let { senderRequestable } = await this.parseMentions({
      senderRequired: !artistName || !trackName,
    });

    if (!artistName || !trackName) {
      let nowPlaying = await this.lastFMService.nowPlaying(senderRequestable);

      if (!artistName) artistName = nowPlaying.artist;
      if (!trackName) trackName = nowPlaying.name;
    } else {
      const lfmTrack = await this.lastFMService.trackInfo({
        artist: artistName,
        track: trackName,
      });

      artistName = lfmTrack.artist.name;
      trackName = lfmTrack.name;
    }

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { rows, track } = response.whoKnowsTrack;

    await this.nicknameService.cacheNicknames(
      response.whoKnowsTrack.rows.map((u) => u.user),
      this.guild.id,
      this.gowonClient
    );

    const embed = this.newEmbed()
      .setTitle(`Who knows ${track.name.italic()} by ${track.artist.strong()}?`)
      .setDescription(
        !track || rows.length === 0
          ? `No one knows this track`
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
