import { gql } from "@apollo/client/core";
import { DocumentNode } from "graphql";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";

export interface Connector<ResponseT, ParamsT> {
  request(
    mirrorballService: MirrorballService,
    vars?: ParamsT
  ): Promise<{ data: ResponseT } | ResponseT>;
}

export abstract class BaseConnector<ResponseT, ParamsT>
  implements Connector<ResponseT, ParamsT>
{
  abstract query: DocumentNode;

  protected paginate = false;
  protected pagesToRequest?: number;

  async request(mirrorballService: MirrorballService, variables?: ParamsT) {
    return await mirrorballService.genericRequest(this.query, variables || {});
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
