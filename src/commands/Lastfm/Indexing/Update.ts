import { Stopwatch } from "../../../helpers";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { CommandRedirect } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayProgressBar } from "../../../lib/ui/displays";
import Index from "./Index";

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
    { when: (args) => args.full, redirectTo: Index },
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

    const observable = this.lilacUsersService.indexingProgress(this.ctx, {
      discordID: this.author.id,
    });

    const embed = this.minimalEmbed().setDescription(
      "Updating your indexed data..."
    );

    await this.reply(embed);

    const stopwatch = new Stopwatch().start();

    const subscription = observable.subscribe(async (progress) => {
      if (progress.page === progress.totalPages) {
        await embed
          .setDescription(`${Emoji.checkmark} Done!`)
          .editMessage(this.ctx);

        subscription.unsubscribe();
      } else if (stopwatch.elapsedInMilliseconds >= 3000) {
        const description = `Updating...
        ${displayProgressBar(progress.page, progress.totalPages, {
          width: this.progressBarWidth,
        })}
        *Page ${progress.page}/${progress.totalPages}*`;

        await embed.setDescription(description).editMessage(this.ctx);

        stopwatch.zero().start();
      }
    });
  }
}
