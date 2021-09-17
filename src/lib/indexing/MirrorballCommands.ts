import { BaseCommand } from "../command/BaseCommand";
import { Connector } from "./BaseConnector";
import { Arguments } from "../arguments/arguments";
import { MirrorballError, LogicError, UserNotIndexedError } from "../../errors";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { Perspective } from "../Perspective";
import { Message, MessageEmbed } from "discord.js";
import { User as DBUser } from "../../database/entity/User";
import { ConfirmationEmbed } from "../views/embeds/ConfirmationEmbed";
import {
  ConcurrencyService,
  ConcurrentActions,
} from "../../services/ConcurrencyService";
import { errorEmbed } from "../views/embeds";
import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export interface ErrorResponse {
  errors: { message: string }[];
}

function hasErrors(response: any): response is ErrorResponse {
  return (
    response?.errors &&
    response.errors instanceof Array &&
    response.errors.length > 0
  );
}

export abstract class MirrorballBaseCommand<
  ResponseT,
  ParamsT,
  ArgumentsT extends Arguments = Arguments
> extends BaseCommand<ArgumentsT> {
  abstract connector: Connector<ResponseT, ParamsT>;
  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);
  concurrencyService = ServiceRegistry.get(ConcurrencyService);

  readonly indexingHelp =
    '"Indexing" means downloading all your last.fm data. This is required for many commands to function, and is recommended.';
  readonly indexingInProgressHelp =
    "\n\nIndexing... (this may take a while - I'll ping you when I'm done!)";
  readonly indexingErrorMessage =
    "An unexpected error ocurred, please try again!";

  protected get query(): (variables: ParamsT) => Promise<ResponseT> {
    return async (variables) => {
      let response: ResponseT = {} as any;

      try {
        const rawResponse = await this.connector.request(this.ctx, variables);

        if ((rawResponse as any).data) {
          response = (rawResponse as any).data;
        } else {
          response = rawResponse as ResponseT;
        }
      } catch (e) {
        if (e.graphQLErrors?.length) {
          (response as any).errors = e.graphQLErrors;
        } else if (e.networkError) {
          this.logger.logError(e);
          throw new MirrorballError(
            "The indexing service is not responding, please try again later."
          );
        }
      }

      return response;
    };
  }

  protected parseErrors(response: any): ErrorResponse | undefined {
    if (hasErrors(response)) {
      return response;
    } else return;
  }

  protected async updateAndWait(
    discordID: string,
    timeout = 2000
  ): Promise<void> {
    return await this.mirrorballService.updateAndWait(
      this.ctx,
      discordID,
      timeout
    );
  }

  protected async notifyUser(
    perspective: Perspective,
    type: "update" | "index",
    replyTo?: Message,
    error?: string
  ) {
    let message: MessageEmbed;

    if (error) {
      message = errorEmbed(
        this.newEmbed(),
        this.author,
        this.indexingErrorMessage
      );
    } else {
      message = this.newEmbed()
        .setAuthor(
          ...this.generateEmbedAuthor(type === "index" ? "Indexing" : "Update")
        )
        .setDescription(
          `${perspective.upper.plusToHave} been ${
            type === "index" ? "fully indexed" : "updated"
          } successfully!`
        );
    }

    (replyTo || this.message).channel.send({
      content: `<@!${this.message.author.id}>`,
      embeds: [message],
    });
  }

  protected async throwIfNotIndexed(
    user: DBUser | undefined,
    perspective: Perspective
  ) {
    if (!user) {
      throw new LogicError(
        "The user you have specified is not signed into the bot!"
      );
    }

    if (!user.isIndexed) {
      const isAuthor = perspective.name === "you";

      const embed = errorEmbed(
        this.newEmbed(),
        this.author,
        `This command requires ${perspective.name} to be indexed to execute!` +
          (isAuthor ? " Would you like to index now?" : "")
      ).setAuthor(...this.generateEmbedAuthor("Error"));

      if (isAuthor) {
        const confirmationEmbed = new ConfirmationEmbed(
          this.message,
          embed,
          this.gowonClient
        );

        if (await confirmationEmbed.awaitConfirmation()) {
          this.impromptuIndex(
            embed,
            confirmationEmbed,
            user.lastFMUsername,
            user.discordID
          );
        }

        const error = new UserNotIndexedError();
        error.silent = true;

        throw error;
      }
    }
  }

  protected async impromptuIndex(
    embed: MessageEmbed,
    confirmationEmbed: ConfirmationEmbed,
    username: string,
    discordID: string
  ) {
    await confirmationEmbed.sentMessage!.edit({
      embeds: [
        embed.setDescription(
          embed.description + "\n" + this.indexingInProgressHelp
        ),
      ],
    });
    await this.concurrencyService.registerUser(
      ConcurrentActions.Indexing,
      discordID
    );
    await this.mirrorballService.fullIndex(this.ctx);
    this.concurrencyService.registerUser(ConcurrentActions.Indexing, discordID);
    this.notifyUser(
      Perspective.buildPerspective(username, false),
      "index",
      confirmationEmbed.sentMessage
    );
  }
}

export abstract class MirrorballChildCommand<
  ResponseT,
  ParamsT,
  T extends Arguments
> extends MirrorballBaseCommand<ResponseT, ParamsT, T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
