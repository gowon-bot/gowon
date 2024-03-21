import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { SyncingProgressView } from "../../../lib/ui/views/SyncingProgressView";

const args = {
  force: new Flag({
    shortnames: ["f"],
    longnames: ["force"],
    description: "Stop your current sync and restart it",
  }),
};

export default class Sync extends LilacBaseCommand<typeof args> {
  idSeed = "iz*one yujin";
  subcategory = "library";
  description = "Fully syncs your Last.fm data to Gowon";
  aliases = ["fullindex", "index"];

  arguments = args;

  slashCommand = true;

  async run() {
    this.lilacGuildsService.addUser(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

    const embed = this.minimalEmbed()
      .setDescription(
        "Syncing will download all your scrobbles from Last.fm. Are you sure you want to sync?"
      )
      .setFooter(this.syncHelp);

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    if (!(await confirmationEmbed.awaitConfirmation(this.ctx))) {
      return;
    }

    await this.lilacUsersService.sync(
      this.ctx,
      { discordID: this.author.id },
      this.parsedArguments.force
    );

    const observable = this.lilacUsersService.syncProgress(this.ctx, {
      discordID: this.author.id,
    });

    const syncProgressView = new SyncingProgressView(
      this.ctx,
      embed,
      observable
    );

    syncProgressView.subscribeToObservable();
  }
}
