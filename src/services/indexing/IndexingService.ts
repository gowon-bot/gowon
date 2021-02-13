import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";
import request from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { BaseService } from "../BaseService";

export class IndexingService extends BaseService {
  private readonly baseURL = "http://localhost:8080/graphql";

  private async sendRequest(
    query: RequestDocument,
    variables?: object
  ): Promise<any> {
    this.log(
      `Sending request to ${this.baseURL} with variables ${JSON.stringify(
        variables,
        undefined,
        2
      )}`
    );

    return await (variables
      ? request(this.baseURL, query, variables)
      : request(this.baseURL, query));
  }

  public webhook = IndexingWebhookService.getInstance();

  async genericRequest<T = any>(
    query: DocumentNode,
    variables: { [key: string]: any }
  ): Promise<T> {
    return await this.sendRequest(query, variables);
  }

  public async ping(): Promise<{ ping: string }> {
    return await this.genericRequest(
      gql`
        query {
          ping
        }
      `,
      {}
    );
  }
}
