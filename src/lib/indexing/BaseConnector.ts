import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { SimpleMap } from "../../helpers/types";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonContext } from "../context/Context";

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

  async request(ctx: GowonContext, variables?: ParamsT) {
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
  } satisfies Record<string, DocumentNode>;
}
