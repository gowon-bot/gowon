import Axios, { AxiosInstance } from "axios";
import config from "../../../config.json";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import {
  CreateIssueParams,
  CreateIssueResponse,
  Params,
} from "./GithubService.types";

export class GithubService extends BaseService {
  private baseURL = "https://api.github.com";

  public readonly owner = "gowon-bot";
  public readonly repo = "gowon";

  get axios(): AxiosInstance {
    return Axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: this.Authorization,
      },
    });
  }

  private get Authorization(): string {
    return this.basicAuthorization(
      config.githubUsername,
      config.githubAuthToken
    );
  }

  async request<T>(
    ctx: GowonContext,
    path: string,
    options: { params?: Params; verb?: "POST" | "GET" } = {}
  ): Promise<T> {
    this.log(
      ctx,
      `made github API request for ${path}` + options.params
        ? `with params ${JSON.stringify(options.params)}`
        : ""
    );

    let response: { data: any } = { data: {} };

    if (options.verb === "POST") {
      response = await this.axios.post(path, options.params!);
    } else if (options.verb === "GET") {
      response = await this.axios.get(path);
    }

    return response.data as T;
  }

  async createIssue(
    ctx: GowonContext,
    params: CreateIssueParams
  ): Promise<CreateIssueResponse> {
    return await this.request<CreateIssueResponse>(
      ctx,
      `/repos/${this.owner}/${this.repo}/issues`,
      {
        params,
        verb: "POST",
      }
    );
  }
}
