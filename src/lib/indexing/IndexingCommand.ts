import { BaseCommand } from "../command/BaseCommand";
import { Connector } from "./BaseConnector";
import { IndexingService } from "../../services/indexing/IndexingService";
import { Arguments } from "../arguments/arguments";
import { IndexerError, LogicError, UserNotIndexedError } from "../../errors";
import gql from "graphql-tag";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { Perspective } from "../Perspective";
import { MessageEmbed } from "discord.js";
import { User as DBUser } from "../../database/entity/User";
import { ConfirmationEmbed } from "../../helpers/Embeds/ConfirmationEmbed";
import {
  ConcurrencyManager,
  ConcurrentActions,
} from "../caches/ConcurrencyManager";
import { LastFMConverter } from "../../services/LastFM/Converter/LastFMConverter";

export interface ErrorResponse {
  errors: { message: string }[];
}

function hasErrors(response: any): response is ErrorResponse {
  return (
    response.errors &&
    response.errors instanceof Array &&
    response.errors.length > 0
  );
}

export abstract class IndexingBaseCommand<
  ResponseT,
  ParamsT,
  ArgumentsT extends Arguments = Arguments
> extends BaseCommand<ArgumentsT> {
  abstract connector: Connector<ResponseT, ParamsT>;
  indexingService = new IndexingService(this.logger);
  lastFMService = new LastFMService(this.logger);
  lastFMConverter = new LastFMConverter(this.logger);
  concurrencyManager = new ConcurrencyManager();

  protected readonly indexerGuilds = [
    "768596255697272862",
    "769112727103995904",
  ];

  readonly indexingHelp =
    '"Indexing" means downloading all your last.fm data. This is required for many commands to function, and is recommended.';
  readonly indexingInProgressHelp =
    "\n\nIndexing... (this may take a while - I'll ping you when I'm done!)";

  protected get query(): (variables: ParamsT) => Promise<ResponseT> {
    return async (variables) => {
      let response: ResponseT = {} as any;

      try {
        response = await this.connector.request(
          this.indexingService,
          variables
        );
      } catch (e) {
        if (e.errno === "ECONNREFUSED") {
          throw new IndexerError(
            "The indexing service is not responding, please try again later."
          );
        } else {
          (response as any).errors = e.response.errors;
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
    username: string,
    timeout = 2000
  ): Promise<void> {
    const query = gql`
      mutation update($user: UserInput!) {
        update(user: $user) {
          token
        }
      }
    `;

    const response = (await this.indexingService.genericRequest(query, {
      user: { lastFMUsername: username },
    })) as {
      update: { token: string };
    };

    return await this.indexingService.webhook
      .waitForResponse(response.update.token, timeout)
      .catch(() => {});
  }

  protected async notifyUser(
    perspective: Perspective,
    type: "update" | "index"
  ) {
    this.reply(
      `${perspective.upper.plusToHave} been ${
        type === "index" ? "fully indexed" : "updated"
      } successfully!`,
      { ping: true }
    );
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

      const embed = this.newEmbed()
        .setAuthor(...this.generateEmbedAuthor("Error"))
        .setColor(this.errorColour)
        .setDescription(
          `This command requires ${perspective.name} to be indexed to execute!` +
            (isAuthor ? " Would you like to index now?" : "")
        );

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
    this.stopTyping();
    await confirmationEmbed.sentMessage!.edit(
      embed.setDescription(
        embed.description + "\n" + this.indexingInProgressHelp
      )
    );
    await this.concurrencyManager.registerUser(
      ConcurrentActions.Indexing,
      discordID
    );
    await this.indexingService.fullIndex(discordID);
    this.concurrencyManager.registerUser(ConcurrentActions.Indexing, discordID);
    this.notifyUser(Perspective.buildPerspective(username, false), "index");
  }
}
