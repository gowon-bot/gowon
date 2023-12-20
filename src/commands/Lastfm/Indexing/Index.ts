import { Stopwatch } from "../../../helpers";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { displayProgressBar } from "../../../lib/ui/displays";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";

export default class Index extends LilacBaseCommand {
  idSeed = "iz*one yujin";
  subcategory = "library";
  description = "Fully index, downloading all your Last.fm data";
  aliases = ["fullindex"];

  slashCommand = true;

  async run() {
    this.lilacGuildsService.addUser(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

    const embed = this.authorEmbed()
      .setHeader("Lilac indexing")
      .setDescription(
        "Indexing will download all your scrobbles from Last.fm. Are you sure you want to full index?"
      )
      .setFooter(this.indexingHelp);

    const confirmationEmbed = new ConfirmationView(this.ctx, embed);

    if (!(await confirmationEmbed.awaitConfirmation(this.ctx))) {
      return;
    }

    await this.lilacUsersService.index(this.ctx, { discordID: this.author.id });

    confirmationEmbed.sentMessage?.edit({
      embeds: [
        embed
          .setDescription(
            `Indexing...\n${displayProgressBar(0, 1, {
              width: this.progressBarWidth,
            })}\n*Loading...*`
          )
          .asMessageEmbed(),
      ],
    });

    const observable = this.lilacUsersService.indexingProgress(this.ctx, {
      discordID: this.author.id,
    });

    const sentMessage = confirmationEmbed.sentMessage!;

    const stopwatch = new Stopwatch().start();

    await this.usersService.setIndexed(this.ctx, this.author.id, false);

    const subscription = observable.subscribe(async (progress) => {
      if (progress.page === progress.totalPages) {
        await this.usersService.setIndexed(this.ctx, this.author.id);
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription("Done!").asMessageEmbed()
        );
        subscription.unsubscribe();
      } else if (stopwatch.elapsedInMilliseconds >= 3000) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed
            .setDescription(
              `Indexing...
${displayProgressBar(progress.page, progress.totalPages, {
  width: this.progressBarWidth,
})}
*Page ${progress.page}/${progress.totalPages}*`
            )
            .asMessageEmbed()
        );

        stopwatch.zero().start();
      }
    });
  }
}
