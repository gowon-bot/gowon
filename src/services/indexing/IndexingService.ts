import { DocumentNode } from "graphql";
import request from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { BaseService } from "../BaseService";
import { IndexingQueries } from "./IndexingQueries";

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

  public async fullIndex(username: string): Promise<any> {
    return await this.sendRequest(IndexingQueries.FULL_INDEX, { username });
  }

  public async userTopArtists(username: string): Promise<any> {
    return await this.sendRequest(IndexingQueries.USER_TOP_ARTISTS, {
      username,
    });
  }

  public async whoKnowsArtist(artist: string): Promise<any> {
    return await this.sendRequest(IndexingQueries.WHO_KNOWS_ARTIST, { artist });
  }

  public async update(username: string): Promise<any> {
    return await this.sendRequest(IndexingQueries.UPDATE, { username });
  }
}
