import { DocumentNode } from "graphql";
import { IndexingService } from "../../services/indexing/IndexingService";

export interface Connector<ResponseT, ParamsT> {
  request(indexingService: IndexingService, vars?: ParamsT): Promise<ResponseT>;
}

export abstract class BaseConnector<ResponseT, ParamsT>
  implements Connector<ResponseT, ParamsT> {
  abstract query: DocumentNode;

  async request(indexingService: IndexingService, variables?: ParamsT) {
    return await indexingService.genericRequest(this.query, variables || {});
  }
}
