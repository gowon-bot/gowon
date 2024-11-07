export interface ErrorReportPayload {
  message: string;
  kind: string;
  application: string;
  userID: string;
  severity: GowonErrorSeverity;
  stack: string;
  tags: ErrorReportTagPayload[];
}

export interface ErrorReportTagPayload {
  key: string;
  value: string;
}

export enum GowonErrorSeverity {
  WARNING = "warning",
  ERROR = "error",
  EXCEPTION = "exception",
}
