import { supernovaPassword, supernovaURL } from "../../../config.json";
import { ClientError, ClientWarning } from "../../errors/errors";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";
import {
  ErrorReportPayload,
  GowonErrorSeverity,
} from "../supernova/supernovaTypes";

export type ErrorWithSupernovaID = Error & {
  supernovaID: string;
};

export class ErrorReportingService extends BaseService {
  public async reportError(
    ctx: GowonContext,
    e: Error
  ): Promise<string | undefined> {
    if (this.alreadyReportedToSupernova(e)) {
      await this.fetch(
        `${e.supernovaID}/modify`,
        "POST",
        this.generateModifyPayload(ctx)
      );

      return e.supernovaID;
    }

    try {
      const response = await this.fetch(
        "report",
        "POST",
        this.generatePayload(ctx, e)
      );

      const { error } = await response.json();

      return error.id;
    } catch {
      return undefined;
    }
  }

  private generatePayload(ctx: GowonContext, e: Error): ErrorReportPayload {
    return {
      kind: e.name,
      message: e.message,
      application: "Gowon",
      userID: ctx.author.id,
      severity: this.getSeverity(e),
      stack: e.stack ?? "(no stack)",
      tags: this.generateTags(ctx),
    };
  }

  private generateModifyPayload(
    ctx: GowonContext
  ): Partial<ErrorReportPayload> {
    return {
      userID: ctx.author.id,
      tags: this.generateTags(ctx),
    };
  }

  private generateTags(ctx: GowonContext): ErrorReportPayload["tags"] {
    return [
      { key: "command", value: ctx.command.name },
      { key: "guild", value: ctx.guild?.id ?? "DM" },
      { key: "runas", value: ctx.extract.matched },
    ];
  }

  private getSeverity(e: Error): GowonErrorSeverity {
    return e instanceof ClientWarning
      ? GowonErrorSeverity.WARNING
      : e instanceof ClientError
      ? GowonErrorSeverity.EXCEPTION
      : GowonErrorSeverity.ERROR;
  }

  private getURL(path: string): string {
    return supernovaURL + "api/errors/" + path;
  }

  private async fetch(path: string, method: "GET" | "POST", body?: any) {
    return fetch(this.getURL(path), {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Password ${supernovaPassword}`,
      },
    });
  }

  private alreadyReportedToSupernova(
    error: Error
  ): error is ErrorWithSupernovaID {
    return "supernovaID" in error;
  }
}
