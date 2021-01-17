import request from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { BaseService } from "../BaseService";
import { IndexingQueries, IndexingQuery } from "./IndexingQueries";

export class IndexingService extends BaseService {
  private readonly baseURL = "http://localhost:8080/graphql";

  private async sendRequest(
    query: RequestDocument,
    variables?: object
  ): Promise<any> {
    this.log(
      `Sending request to ${this.baseURL} for ${
        (query.toString().match(/(query|mutation)\s+\w+/) || [])[0]
      } with variables ${JSON.stringify(variables, undefined, 2)}`
    );

    return await (variables
      ? request(this.baseURL, query, variables)
      : request(this.baseURL, query));
  }

  async genericRequest(query: IndexingQuery): Promise<any> {
    return await this.sendRequest(IndexingQueries[query]);
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
