import fetch, { Response } from "node-fetch";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class ChartService extends BaseService {
  private readonly baseURL = "http://localhost:3002/api";

  private async makeRequest(
    ctx: GowonContext,
    path: string,
    variables?: object
  ): Promise<Response> {
    const stringifiedVariables = JSON.stringify(variables, undefined, 2);

    this.log(
      ctx,
      `Sending request to ${this.baseURL} with variables ${
        stringifiedVariables.length > 300
          ? stringifiedVariables.slice(0, 300) + "..."
          : stringifiedVariables
      }`
    );

    try {
      return await fetch(this.baseURL + "/" + path, {
        method: "post",
        body: JSON.stringify(variables),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e: any) {
      throw e;
    }
  }

  public async createChart(
    ctx: GowonContext,
    images: { url: string }[],
    size: { width: 1000; height: 1000 }
  ): Promise<Buffer> {
    const response = await this.makeRequest(ctx, "chart/create", {
      urls: images,
      size,
    });

    return await response.buffer();
  }
}
