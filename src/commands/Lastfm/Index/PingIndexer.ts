import { Arguments } from "../../../lib/arguments/arguments";
import { BaseConnector } from "../../../lib/indexing/BaseConnector";
import { IndexingCommand } from "../../../lib/indexing/IndexingCommand";
import gql from "graphql-tag";

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

export default class PingIndexer extends IndexingCommand<
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

    console.log(response);

    if (!response.ping) {
      await this.send("No repsonse :(");
    } else {
      await this.send(response.ping);
    }
  }
}
