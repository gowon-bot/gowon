import { BaseCommand } from "../command/BaseCommand";
import { Connector } from "./BaseConnector";
import { IndexingService } from "../../services/indexing/IndexingService";
import { Arguments } from "../arguments/arguments";
import { IndexerError } from "../../errors";
import gql from "graphql-tag";
import { LastFMService } from "../../services/LastFM/LastFMService";

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

export abstract class IndexingCommand<
  ResponseT,
  ParamsT,
  ArgumentsT extends Arguments = Arguments
> extends BaseCommand<ArgumentsT> {
  abstract connector: Connector<ResponseT, ParamsT>;

  indexingService = new IndexingService(this.logger);
  lastFMService = new LastFMService(this.logger);

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
}
