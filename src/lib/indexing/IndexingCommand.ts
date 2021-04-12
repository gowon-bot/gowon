import { BaseCommand } from "../command/BaseCommand";
import { Connector } from "./BaseConnector";
import { IndexingService } from "../../services/indexing/IndexingService";
import { Arguments } from "../arguments/arguments";
import { IndexerError } from "../../errors";
import gql from "graphql-tag";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { Perspective } from "../Perspective";

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
}
