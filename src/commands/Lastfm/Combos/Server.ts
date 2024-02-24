import { Combo } from "../../../database/entity/Combo";
import { NoServerCombosError } from "../../../errors/commands/combo";
import { bold } from "../../../helpers/discord";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumberedList } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { NicknameService } from "../../../services/Discord/NicknameService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { ComboChildCommand } from "./ComboChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class ServerCombos extends ComboChildCommand<typeof args> {
  idSeed = "wonder girls hyelim";

  aliases = ["server", "scbs"];
  description = "Shows your server's largest combos";
  subcategory = "library stats";
  usage = [""];

  arguments = args;

  slashCommand = true;
  slashCommandName = "server";
  guildRequired = true;

  nicknameService = ServiceRegistry.get(NicknameService);
  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);

  async run() {
    let artistName = this.parsedArguments.artist;

    if (artistName) {
      [artistName] = await this.lilacArtistsService.correctArtistNames(
        this.ctx,
        [artistName]
      );
    }

    const serverUsers = await this.serverUserIDs();

    await this.nicknameService.cacheNicknames(this.ctx, serverUsers);

    const combos = await this.comboService.listCombosForUsers(
      this.ctx,
      serverUsers,
      artistName
    );

    if (!combos.length) {
      throw new NoServerCombosError(this.prefix, artistName);
    }

    const embed = this.minimalEmbed().setTitle(
      artistName ? "Server artist combos" : "Server combos"
    );

    const displayCombo = ((combo: Combo) => {
      const nickname = this.nicknameService.cacheGetNickname(
        this.ctx,
        combo.user.discordID
      );

      return bold(nickname) + ": " + this.displayCombo(combo);
    }).bind(this);

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: combos,
      pageSize: 5,
      pageRenderer(combos, { offset }) {
        return displayNumberedList(combos.map(displayCombo), offset);
      },
      overrides: { itemName: "combo" },
    });

    await this.reply(scrollingEmbed);
  }
}
