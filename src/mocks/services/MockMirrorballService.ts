import { DocumentNode } from "graphql";
import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export class MockMirrorballService extends BaseMockService {
  async query<T = any>(
    _ctx: GowonContext,
    _query: DocumentNode,
    _variables?: SimpleMap
  ): Promise<T> {
    return {} as T;
  }

  async mutate<T = any>(
    _ctx: GowonContext,
    _mutation: DocumentNode,
    _variables?: SimpleMap
  ): Promise<T> {
    return {} as T;
  }

  public async ping(_ctx: GowonContext): Promise<{ ping: string }> {
    return { ping: "pong" };
  }
}
