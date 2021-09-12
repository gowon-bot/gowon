import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { SimpleMap } from "../../helpers/types";
import { BaseServiceContext } from "../../services/BaseService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export interface Connector<ResponseT, ParamsT> {
  request(
    ctx: SimpleMap,
    vars?: ParamsT
  ): Promise<{ data: ResponseT } | ResponseT>;
}

export abstract class BaseConnector<ResponseT, ParamsT>
  implements Connector<ResponseT, ParamsT>
{
  abstract query: DocumentNode;

  protected paginate = false;
  protected pagesToRequest?: number;

  private mirrorballService = ServiceRegistry.get(MirrorballService);

  async request(ctx: BaseServiceContext, variables?: ParamsT) {
    return await this.mirrorballService.query(ctx, this.query, variables || {});
  }

  fragments = {
    taskStartResponse: gql`
      fragment TaskStartResponseFields on TaskStartResponse {
        taskName
        token
        success
      }
    `,
  } as const;
}

export class EmptyConnector extends BaseConnector<never, any> {
  query = gql`
    query {
      ping
    }
  `;
}
