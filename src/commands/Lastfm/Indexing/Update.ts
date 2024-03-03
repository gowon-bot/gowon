import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { CommandRedirect } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SyncingProgressView } from "../../../lib/ui/views/SyncingProgressView";
import Sync from "./Sync";

const args = {
  full: new Flag({
    shortnames: [],
    longnames: ["full", "force"],
    description: "Do a full index (download all your data)",
  }),
} satisfies ArgumentsMap;

export default class Update extends LilacBaseCommand<typeof args> {
  idSeed = "bvndit yiyeon";
  aliases = ["u", "🆙date"];
  subcategory = "library";
  description = "Updates a user's cached data based on their lastest scrobbles";

  slashCommand = true;
  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    { when: (args) => args.full, redirectTo: Sync },
  ];

  async run() {
    this.lilacGuildsService.addUser(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

    await this.lilacUsersService.update(this.ctx, {
      discordID: this.author.id,
    });

    const observable = this.lilacUsersService.syncProgress(this.ctx, {
      discordID: this.author.id,
    });

    const embed = this.minimalEmbed().setDescription(
      "Updating your synced data..."
    );

    await this.reply(embed);

    const syncingProgressView = new SyncingProgressView(
      this.ctx,
      embed,
      observable
    );

    syncingProgressView.subscribeToObservable(false);
  }
}
