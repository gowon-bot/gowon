import { BaseService } from "../BaseService";
import {
  Params,
  CreateIssueParams,
  CreateIssueResponse,
} from "./GithubService.types";
import config from "../../../config.json";
import Axios, { AxiosInstance } from "axios";

export class GithubService extends BaseService {
  private baseURL = "https://api.github.com";

  private owner = "jivison";
  private repo = "gowon";

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
    return `Basic ${Buffer.from(
      `${config.githubUsername}:${config.githubPassword}`,
      "binary"
    ).toString("base64")}`;
  }

  async request<T>(
    path: string,
    options: { params?: Params; verb?: "POST" | "GET" } = {}
  ): Promise<T> {
    this.log(
      `made github API request for ${path}` + options.params
        ? `with params ${JSON.stringify(options.params)}`
        : ""
    );

    let response: { data: any } = { data: {} };

    if (options.verb === "POST") {
      response = await this.axios.post(path, options.params!);
    }

    return response.data as T;
  }

  async createIssue(params: CreateIssueParams): Promise<CreateIssueResponse> {
    return await this.request<CreateIssueResponse>(
      `/repos/${this.owner}/${this.repo}/issues`,
      {
        params,
        verb: "POST",
      }
    );
  }
}
