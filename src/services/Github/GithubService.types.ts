export interface GithubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface CreateIssueResponse {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: GithubUser;
  labels: {
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string;
    color: string;
    default: true;
  }[];

  assignee: GithubUser;
  assignees: GithubUser[];
  milestone: {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    state: string;
    title: string;
    description: string;
    creator: GithubUser;
    open_issues: number;
    closed_issues: number;
    created_at: string;
    updated_at: string;
    closed_at: string;
    due_on: string;
  };
  locked: true;
  active_lock_reason: string;
  comments: 0;
  pull_request: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  closed_by: GithubUser;
}

/// ==================
// Inputs
/// ==================

export interface Params {}

export interface CreateIssueParams extends Params {
  title: string;
  body?: string;
  milestone?: string;
  labels?: [string];
  assignees?: [string];
}
