export interface GithubUser {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
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

export interface GetBranchResponse {
  name: string;
  commit: TopLevelCommit;
  _links: Links;
  protected: boolean;
  protection: Protection;
  protection_url: string;
}

export interface Links {
  html: string;
  self: string;
}

export interface TopLevelCommit {
  sha: string;
  node_id: string;
  commit: Commit;
  author: GithubUser;
  parents: Tree[];
  url: string;
  committer: GithubUser;
  html_url: string;
  comments_url: string;
}

export interface Commit {
  author: CommitAuthor;
  url: string;
  message: string;
  tree: Tree;
  committer: CommitAuthor;
  verification: Verification;
  comment_count: number;
}

export interface CommitAuthor {
  name: string;
  date: string;
  email: string;
}

export interface Tree {
  sha: string;
  url: string;
}

export interface Verification {
  verified: boolean;
  reason: string;
  signature: null;
  payload: null;
}

export interface Protection {
  enabled: boolean;
  required_status_checks: RequiredStatusChecks;
}

export interface RequiredStatusChecks {
  enforcement_level: string;
  contexts: string[];
}

/// ==================
// Inputs
/// ==================

export interface Params {}

export interface CreateIssueParams extends Params {
  title: string;
  body?: string;
  milestone?: string;
  labels?: string[];
  assignees?: string[];
}
