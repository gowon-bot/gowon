import { BaseService } from "../BaseService";
import {
  Params,
  CreateIssueParams,
  CreateIssueResponse,
  GetBranchResponse,
} from "./GithubService.types";
import config from "../../../config.json";
import Axios, { AxiosInstance } from "axios";

export class GithubService extends BaseService {
  private baseURL = "https://api.github.com";

  public readonly owner = "jivison";
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
    } else if (options.verb === "GET") {
      response = await this.axios.get(path);
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

  async getBranch(branch = "master"): Promise<GetBranchResponse> {
    return await this.request<GetBranchResponse>(
      `/repos/${this.owner}/${this.repo}/branches/${branch}`,
      {
        verb: "GET",
      }
    );
  }
}
