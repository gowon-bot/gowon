import { gql } from "@apollo/client/core";
import { Arguments } from "../../../lib/arguments/arguments";
import { BaseConnector } from "../../../lib/indexing/BaseConnector";
import { IndexingBaseCommand } from "../../../lib/indexing/IndexingCommand";

type Response = { ping: string };
type Params = {};

const pingConnector = new (class extends BaseConnector<Response, Params> {
  query = gql`
    query pingIndexer {
      ping
    }
  `;
})();

const args = {
  inputs: {},
  mentions: {},
} as const;

export default class PingIndexer extends IndexingBaseCommand<
  Response,
  Params,
  typeof args
> {
  idSeed = "exid jeonghwa";

  description = "Ping the indexer";
  secretCommand = true;

  connector = pingConnector;

  arguments: Arguments = args;

  async run() {
    const response = await this.query({});

    if (!response.ping) {
      await this.send("No response :(");
    } else {
      await this.send(response.ping);
    }
  }
}
