import { SimpleMap } from "../../helpers/types";
import { GowonContext } from "../context/Context";
import { Paginator } from "./Paginator";

export type MirrorballQueryFunction<P, R> = (
  ctx: GowonContext,
  params: P
) => Promise<R>;

function onPage<P extends SimpleMap, R>(
  callback: MirrorballQueryFunction<P, R>,
  pageSize: number,
  ctx: GowonContext
): (ctx: SimpleMap, params: P & { page?: number }) => Promise<R> {
  return (_, params) => {
    const newParams = Object.assign(params, {
      pageInput: {
        limit: pageSize,
        offset: pageSize * ((params.page || 1) - 1),
      },
    });

    delete newParams["page"];

    return Promise.resolve(callback(ctx, newParams as any));
  };
}

export class MirrorballPaginator<P extends Record<string, unknown>, R> extends Paginator<P, R> {
  constructor(
    callback: MirrorballQueryFunction<P, R>,
    pageSize: number,
    maxPages: number,
    params: P,
    ctx: GowonContext
  ) {
    super(onPage(callback, pageSize, ctx), maxPages, params, ctx);
  }
}
