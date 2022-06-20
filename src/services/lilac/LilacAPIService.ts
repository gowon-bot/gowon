import { gql, Observable } from "@apollo/client";
import { DocumentNode } from "graphql";
import { GowonContext } from "../../lib/context/Context";
import { lilacClient } from "../../lib/Lilac/client";
import { BaseService } from "../BaseService";

export class LilacAPIService extends BaseService {
  async query<R, V>(query: DocumentNode, variables?: V): Promise<R> {
    const response = await lilacClient.query({ query, variables: variables });

    return response.data;
  }

  async mutate<R, V>(mutation: DocumentNode, variables?: V): Promise<R> {
    const response = await lilacClient.mutate({
      mutation,
      variables: variables,
    });

    return response.data;
  }

  subscribe<R, V>(subscription: DocumentNode, variables?: V): Observable<R> {
    const observable = lilacClient.subscribe({
      query: subscription,
      variables: variables,
    });

    return observable.map((response) => response.data as R);
  }

  public async ping(_ctx: GowonContext): Promise<{ ping: string }> {
    return await this.query(
      gql`
        query {
          ping
        }
      `
    );
  }
}
