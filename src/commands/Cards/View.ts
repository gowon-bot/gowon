import { CardNotMintedYetError } from "../../errors/commands/cards";
import { italic } from "../../helpers/discord";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import {
  NicknameService,
  UnknownUserDisplay,
} from "../../services/Discord/NicknameService";
import { WhoKnowsService } from "../../services/Discord/WhoKnowsService";
import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { AlbumCoverService } from "../../services/moderation/AlbumCoverService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CardsChildCommand } from "./CardsChildCommand";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export class View extends CardsChildCommand {
  idSeed = "kep1er yujin";

  description = "Views one of your cards";
  subcategory = "library stats";
  aliases = ["card"];
  usage = [""];

  arguments = args;

  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);
  whoKnowsService = ServiceRegistry.get(WhoKnowsService);
  nicknameService = ServiceRegistry.get(NicknameService);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  async run() {
    const { requestable } = await this.getMentions({
      senderRequired: true,
    });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      requestable,
      { redirect: true }
    );

    const [card, albumInfo] = await Promise.all([
      this.cardsService.getCard(this.ctx, artist, album),
      this.lastFMService.albumInfo(this.ctx, { artist, album }),
    ]);

    if (!card) {
      throw new CardNotMintedYetError();
    }

    const owner = await this.lilacUsersService.fetch(this.ctx, {
      discordID: card.owner.discordID,
    });

    if (owner) {
      await this.nicknameService.cacheNicknames(this.ctx, [owner]);
    }

    const ownerDisplay = !owner
      ? UnknownUserDisplay
      : this.whoKnowsService.displayUser(this.ctx, owner);

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      albumInfo.images.get("large"),
      {
        metadata: { artist, album },
      }
    );

    const embed = this.minimalEmbed()
      .setTitle(card.album)
      .setDescription(
        `by ${italic(card.artist)}

_Card owned by ${ownerDisplay}_ `
      )
      .setThumbnail(albumCover || "");

    await this.reply(embed);
  }
}
