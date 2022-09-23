import { CardNotMintedYetError } from "../../errors/cards";
import { bold, italic } from "../../helpers/discord";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
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
} as const;

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

    const [owner] =
      (await this.mirrorballUsersService.getMirrorballUser(this.ctx, [
        { discordID: card.owner.discordID },
      ])) || [];

    await this.nicknameService.cacheNicknames(this.ctx, [owner.discordID]);

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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("View card"))
      .setDescription(
        `${bold(card.album)}
by ${italic(card.artist)}
_Owned by ${ownerDisplay}_ `
      )
      .setThumbnail(albumCover || "");

    await this.send(embed);
  }
}
