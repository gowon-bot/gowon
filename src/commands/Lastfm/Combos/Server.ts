import { ComboChildCommand } from "./ComboChildCommand";
import { LogicError } from "../../../errors";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumberedList } from "../../../lib/views/displays";
import { Combo } from "../../../database/entity/Combo";
import { NicknameService } from "../../../services/Discord/NicknameService";
import { ArtistsService } from "../../../services/mirrorball/services/ArtistsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...prefabArguments.artist,
} as const;

export class ServerCombos extends ComboChildCommand<typeof args> {
  idSeed = "wonder girls hyelim";

  aliases = ["server", "scbs"];
  description = "Shows your server's largest combos";
  subcategory = "library stats";
  usage = [""];

  arguments = args;

  nicknameService = ServiceRegistry.get(NicknameService);
  artistsService = ServiceRegistry.get(ArtistsService);

  async run() {
    let artistName = this.parsedArguments.artist;

    if (artistName) {
      [artistName] = await this.artistsService.correctArtistNames(this.ctx, [
        artistName,
      ]);
    }

    const serverUsers = await this.serverUserIDs();

    await this.nicknameService.cacheNicknames(this.ctx, serverUsers);

    const combos = await this.comboService.listCombosForUsers(
      this.ctx,
      serverUsers,
      artistName
    );

    if (!combos.length) {
      throw new LogicError(
        `This server doesn't have any ${
          artistName ? `${artistName} ` : ""
        }combos saved yet! \`${this.prefix}combo\` saves your combo`
      );
    }

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor(
        `${this.guild.name}'s top ${artistName ? `${artistName} ` : ""}combos`
      )
    );

    const displayCombo = ((combo: Combo) => {
      const nickname = this.nicknameService.cacheGetNickname(
        this.ctx,
        combo.user.discordID
      );

      return nickname.strong() + ": " + this.displayCombo(combo);
    }).bind(this);

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: combos,
        pageSize: 5,
        pageRenderer(combos, { offset }) {
          return displayNumberedList(combos.map(displayCombo), offset);
        },
      },
      { itemName: "combo" }
    );

    scrollingEmbed.send();
  }
}
