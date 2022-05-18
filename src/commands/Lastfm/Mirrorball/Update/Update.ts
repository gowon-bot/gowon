import {
  MirrorballError,
  LogicError,
  UpdatingDisabledBecauseOfIssueModeError,
} from "../../../../errors/errors";
import { Stopwatch } from "../../../../helpers";
import {
  ConcurrencyService,
  ConcurrentAction,
} from "../../../../services/ConcurrencyService";
import { CommandRedirect } from "../../../../lib/command/Command";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { errorEmbed } from "../../../../lib/views/embeds";
import {
  MirrorballErrorResponses,
  responseHasError,
} from "../../../../services/mirrorball/MirrorballErrorResponses";
import { MirrorballTaskNames } from "../../../../services/mirrorball/MirrorballTaskNames";
import Index from "../Index/Index";
import {
  UpdateUserConnector,
  UpdateUserParams,
  UpdateUserResponse,
} from "./Update.connector";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { Flag } from "../../../../lib/context/arguments/argumentTypes/Flag";
import { code } from "../../../../helpers/discord";
import { BetaAccess } from "../../../../lib/command/access/access";
import { LilacUsersService } from "../../../../services/lilac/LilacUsersService";
import { displayProgressBar } from "../../../../lib/views/displays";

const args = {
  full: new Flag({
    shortnames: [],
    longnames: ["full", "force"],
    description: "Do a full index (download all your data)",
  }),
} as const;

export default class Update extends MirrorballBaseCommand<
  UpdateUserResponse,
  UpdateUserParams,
  typeof args
> {
  connector = new UpdateUserConnector();

  idSeed = "bvndit yiyeon";
  aliases = ["u", "🆙date"];
  subcategory = "library";
  description = "Updates a user's cached data based on their lastest scrobbles";

  slashCommand = true;

  redirects: CommandRedirect<typeof args>[] = [
    { when: (args) => args.full, redirectTo: Index },
  ];

  arguments = args;

  stopwatch = new Stopwatch();

  concurrencyService = ServiceRegistry.get(ConcurrencyService);
  lilacUsersService = ServiceRegistry.get(LilacUsersService);

  async prerun() {
    if (
      await this.concurrencyService.isUserDoingAction(
        this.author.id,
        ConcurrentAction.Indexing,
        ConcurrentAction.Updating
      )
    ) {
      throw new LogicError(
        "You are already being updated or indexed, please wait until you are done!"
      );
    }

    if (this.gowonClient.isInIssueMode)
      throw new UpdatingDisabledBecauseOfIssueModeError();
  }

  async run() {
    this.mirrorballUsersService.quietAddUserToGuild(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

    const { senderUsername, perspective, senderUser } = await this.getMentions({
      authentificationRequired: true,
    });

    const access = new BetaAccess();

    if (access.check(senderUser)) {
      await this.lilacUpdate();

      return;
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Update"))
      .setDescription(`Updating user ${code(senderUsername)}`);

    const sentMessage = await this.send(embed);

    this.stopwatch.start();
    const response = await this.query({
      user: { discordID: this.author.id },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      if (responseHasError(errors, MirrorballErrorResponses.UserDoesntExist)) {
        throw new MirrorballError(
          `Couldn't find you logged into the indexer, try running \`${this.prefix}logout\`, then \`${this.prefix}login\` again`
        );
      } else {
        throw new MirrorballError(errors.errors[0].message);
      }
    } else {
      if (response.update.taskName === MirrorballTaskNames.indexUser) {
        await sentMessage.edit({
          embeds: [
            embed.setDescription(
              embed.description +
                ". Since you haven't been fully indexed yet, this may take a while"
            ),
          ],
        });
      }
    }

    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.Updating,
      this.author.id
    );

    this.mirrorballUsersService.webhook.onResponse(
      response.update.token,
      (error) => {
        this.concurrencyService.unregisterUser(
          this.ctx,
          ConcurrentAction.Updating,
          this.author.id
        );
        if (this.stopwatch.elapsedInSeconds > 5) {
          this.notifyUser(
            perspective,
            response.update.taskName === MirrorballTaskNames.indexUser
              ? "index"
              : "update",
            undefined,
            error
          );
        } else {
          if (error) {
            sentMessage.edit({
              embeds: [
                errorEmbed(
                  embed,
                  this.author,
                  embed.description + "\n\n" + this.indexingErrorMessage
                ),
              ],
            });
          } else {
            sentMessage.edit({
              embeds: [
                embed.setDescription(`Updated user ${code(senderUsername)}!`),
              ],
            });
          }
        }
      }
    );
  }

  private async lilacUpdate() {
    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Lilac updating"))
      .setDescription("Started your updating!");

    const sentMessage = await this.send(embed);

    const stopwatch = new Stopwatch().start();

    const observable = this.lilacUsersService.indexingProgress({
      discordID: this.author.id,
    });

    const subscription = observable.subscribe(async (progress) => {
      if (progress.page === progress.totalPages) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription("Done!")
        );
        subscription.unsubscribe();
      } else if (stopwatch.elapsedInMilliseconds >= 3000) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription(
            `Updating...
${displayProgressBar(progress.page, progress.totalPages, { width: 15 })}
*Page ${progress.page}/${progress.totalPages}*`
          )
        );

        stopwatch.zero().start();
      }
    });

    await this.lilacUsersService.update({ discordID: this.author.id });
  }
}
