import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Command } from "../command/Command";
import { ArgumentsMap } from "../context/arguments/types";
import { Connector } from "./BaseConnector";

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

  protected readonly progressBarWidth = 15;

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
}

export abstract class MirrorballChildCommand<
  ResponseT,
  ParamsT,
  T extends ArgumentsMap = {}
> extends MirrorballBaseCommand<ResponseT, ParamsT, T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
