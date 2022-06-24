import { Command } from "../command/Command";
import { Connector } from "./BaseConnector";
import { ArgumentsMap } from "../context/arguments/types";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { Perspective } from "../Perspective";
import { Message, MessageEmbed } from "discord.js";
import { ConfirmationEmbed } from "../views/embeds/ConfirmationEmbed";
import {
  ConcurrencyService,
  ConcurrentAction,
} from "../../services/ConcurrencyService";
import { errorEmbed } from "../views/embeds";
import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Emoji } from "../Emoji";

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
  ArgumentsT extends ArgumentsMap = {}
> extends Command<ArgumentsT> {
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
      } catch (e: any) {
        if (e.graphQLErrors?.length) {
          (response as any).errors = e.graphQLErrors;
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
    return await this.mirrorballUsersService.updateAndWait(
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
        this.ctx.authorMember,
        this.indexingErrorMessage
      );
    } else {
      message = this.newEmbed()
        .setAuthor(
          this.generateEmbedAuthor(type === "index" ? "Indexing" : "Update")
        )
        .setDescription(
          `${perspective.upper.plusToHave} been ${
            type === "index" ? "fully indexed" : "updated"
          } successfully!`
        );
    }

    this.send(Emoji.gowonScrobbled, {
      withEmbed: message,
      reply: {
        to: replyTo,
        ping: true,
      },
    });
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
    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.Indexing,
      discordID
    );
    await this.mirrorballUsersService.fullIndex(this.ctx);
    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.Indexing,
      discordID
    );
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
  T extends ArgumentsMap = {}
> extends MirrorballBaseCommand<ResponseT, ParamsT, T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
