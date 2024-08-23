import { gql, Observable, OperationVariables } from "@apollo/client";
import { DocumentNode } from "graphql";
import { parseLilacError } from "../../errors/lilac";
import { GowonContext } from "../../lib/context/Context";
import { lilacClient } from "../../lib/Lilac/client";
import { BaseService } from "../BaseService";

export class LilacAPIService extends BaseService {
  protected async query<R, V extends OperationVariables>(
    ctx: GowonContext,
    query: DocumentNode,
    variables?: V,
    cache = true
  ): Promise<R> {
    this.logRequest(ctx, variables, "query");

    try {
      const response = await lilacClient.query<R, V>({
        query,
        variables: variables,
        ...(cache ? {} : { fetchPolicy: "no-cache" }),
      });

      return response.data;
    } catch (e) {
      throw parseLilacError(e as Error);
    }
  }

  protected async mutate<R, V extends OperationVariables>(
    ctx: GowonContext,
    mutation: DocumentNode,
    variables?: V
  ): Promise<R | undefined> {
    this.logRequest(ctx, variables, "mutation");

    try {
      const response = await lilacClient.mutate<R, V>({
        mutation,
        variables: variables,
      });

      return response.data ?? undefined;
    } catch (e) {
      throw parseLilacError(e as Error);
    }
  }

  protected subscribe<R, V extends OperationVariables>(
    ctx: GowonContext,
    subscription: DocumentNode,
    variables?: V
  ): Observable<R> {
    this.logRequest(ctx, variables, "subscription");

    const observable = lilacClient.subscribe<R, V>({
      query: subscription,
      variables: variables,
    });

    return observable.map((response) => response.data as R);
  }

  public async ping(ctx: GowonContext): Promise<{ ping: string }> {
    return await this.query(
      ctx,
      gql`
        query {
          ping
        }
      `
    );
  }

  private logRequest(
    ctx: GowonContext,
    variables: any,
    type: "mutation" | "query" | "subscription"
  ) {
    const stringifiedVariables = JSON.stringify(variables || {}, undefined, 2);

    this.log(
      ctx,
      `Sending Lilac ${type} with variables ${
        stringifiedVariables.length > 500
          ? stringifiedVariables.slice(0, 1000) + "..."
          : stringifiedVariables
      }`
    );
  }
}
