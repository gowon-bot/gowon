import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import config from "../../../config.json";
import { MirrorballError } from "../../errors/errors";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";
import { mirrorballClient } from "../../lib/indexing/client";
import { BaseService } from "../BaseService";

export class MirrorballService extends BaseService {
  private async makeRequest(
    ctx: GowonContext,
    { query, mutation }: { query?: DocumentNode; mutation?: DocumentNode },
    variables?: object
  ): Promise<any> {
    const stringifiedVariables = JSON.stringify(variables, undefined, 2);

    this.log(
      ctx,
      `Sending request to ${config.mirrorballURL} with variables ${
        stringifiedVariables.length > 500
          ? stringifiedVariables.slice(0, 1000) + "..."
          : stringifiedVariables
      }`
    );

    try {
      return query
        ? await mirrorballClient.query({
            query,
            variables,
            fetchPolicy: "no-cache",
            context: {
              headers: {
                // These *should* be temporary
                "Doughnut-Discord-Id": ctx.author.id,
                "Is-Gowon": "true",
              },
            },
          })
        : mutation
        ? await mirrorballClient.mutate({
            mutation,
            variables,
            fetchPolicy: "no-cache",
            context: {
              headers: {
                // These *should* be temporary
                "Doughnut-Discord-Id": ctx.author.id,
                "Is-Gowon": "true",
              },
            },
          })
        : undefined;
    } catch (e: any) {
      if (e.networkError) {
        throw new MirrorballError(
          "The indexing service is not responding, please try again later."
        );
      }
      if (e.message) {
        const operationName = (
          (query?.definitions[0] || mutation?.definitions[0]) as any
        ).name.value;

        // It's often hard to tell which operation network errors are occurring on
        // when multiple queries/mutations are run in a single command
        e.message = operationName + ": " + e.message;

        throw e;
      }
    }
  }

  async query<T = any>(
    ctx: GowonContext,
    query: DocumentNode,
    variables?: SimpleMap
  ): Promise<T> {
    const response = await this.makeRequest(ctx, { query }, variables);

    if (response.error) {
      throw response.errors || response.error;
    }

    return response.data;
  }

  async mutate<T = any>(
    ctx: GowonContext,
    mutation: DocumentNode,
    variables?: SimpleMap
  ): Promise<T> {
    const response = await this.makeRequest(ctx, { mutation }, variables);

    if (response.error) {
      throw response.errors || response.error;
    }

    return response.data;
  }

  public async ping(ctx: GowonContext): Promise<{ ping: string }> {
    return await this.query(
      ctx,
      gql`
        query {
          ping
        }
      `,
      {}
    );
  }
}
