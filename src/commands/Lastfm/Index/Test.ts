import { BaseConnector } from "../../../lib/indexing/BaseConnector";
import gql from "graphql-tag";
import { IndexingCommand } from "../../../lib/indexing/IndexingCommand";

const connector = new (class extends BaseConnector<
  { test: string },
  { artist: string }
> {
  query = gql`
    query {
      test
    }
  `;
})();

export default class Test extends IndexingCommand<
  { test: string },
  { artist: string }
> {
  idSeed = "testing indexing testing";
  connector = connector;

  async run() {
    // const test = await this.query({ artist: "" });
  }
}
