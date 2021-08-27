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
import {
  NicknameService,
  UnknownUserDisplay,
} from "../../../../services/guilds/NicknameService";
import { WhoKnowsService } from "../../../../services/guilds/WhoKnowsService";
import {
  WhoKnowsAlbumConnector,
  WhoKnowsAlbumParams,
  WhoKnowsAlbumResponse,
} from "./WhoKnowsAlbum.connector";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
} as const;

export default class WhoKnowsAlbum extends MirrorballBaseCommand<
  WhoKnowsAlbumResponse,
  WhoKnowsAlbumParams,
  typeof args
> {
  connector = new WhoKnowsAlbumConnector();

  idSeed = "redsquare green";

  aliases = ["wkl", "wka", "fmwka"];

  variations: Variation[] = [{ name: "update", variation: ["uwkl", "uwka"] }];

  subcategory = "whoknows";
  description = "See who knows an album";

  arguments: Arguments = args;

  nicknameService = new NicknameService(this.logger);
  whoKnowsService = new WhoKnowsService(this.logger);

  async run() {
    let { senderRequestable, senderUser } = await this.parseMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.album,
    });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(senderRequestable, true);

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      album: { name: albumName, artist: { name: artistName } },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { rows, album } = response.whoKnowsAlbum;

    await this.nicknameService.cacheNicknames(
      response.whoKnowsAlbum.rows.map((u) => u.user),
      this.guild.id,
      this.gowonClient
    );

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `Who knows ${album.name.italic()} by ${album.artist.name.strong()}?`
      )
      .setDescription(
        !album || rows.length === 0
          ? `No one knows this album`
          : displayNumberedList(
              rows.map((wk) => {
                const nickname = this.nicknameService.cacheGetNickname(
                  wk.user.discordID
                );

                const isUnknown = nickname === UnknownUserDisplay;

                if (isUnknown) {
                  this.whoKnowsService.recordUnknownMember(
                    this.guild.id,
                    wk.user.discordID
                  );
                }

                const nicknameDisplay = isUnknown
                  ? nickname
                  : displayLink(
                      nickname,
                      LinkGenerator.userPage(wk.user.username)
                    );

                return `${
                  wk.user.discordID === senderUser?.discordID
                    ? nicknameDisplay.strong()
                    : nicknameDisplay
                } - **${displayNumber(wk.playcount, "**play")}`;
              })
            )
      );

    await this.send(embed);
  }
}
