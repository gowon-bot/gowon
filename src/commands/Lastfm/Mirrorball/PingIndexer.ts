import { gql } from "@apollo/client/core";
import { BaseConnector } from "../../../lib/indexing/BaseConnector";
import { MirrorballBaseCommand } from "../../../lib/indexing/MirrorballCommands";

type Response = { ping: string };
type Params = {};

const pingConnector = new (class extends BaseConnector<Response, Params> {
  query = gql`
    query pingIndexer {
      ping
    }
  `;
})();

export default class PingMirrorball extends MirrorballBaseCommand<
  Response,
  Params
> {
  idSeed = "exid jeonghwa";
  aliases = ["pingindexer"];

  description = "Ping Mirrorball";
  subcategory = "developer";
  secretCommand = true;

  connector = pingConnector;

  async run() {
    const response = await this.query({});

    if (!response.ping) {
      await this.reply("No response :(");
    } else {
      await this.reply(response.ping);
    }
  }
}
