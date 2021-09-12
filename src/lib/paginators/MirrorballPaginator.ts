import { SimpleMap } from "../../helpers/types";
import { Paginator } from "./Paginator";

export type MirrorballQueryFunction<P, R> = (
  ctx: SimpleMap,
  params: P
) => Promise<R>;

function onPage<P extends SimpleMap, R>(
  callback: MirrorballQueryFunction<P, R>,
  pageSize: number,
  ctx: SimpleMap
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

export class MirrorballPaginator<P, R> extends Paginator<P, R> {
  constructor(
    callback: MirrorballQueryFunction<P, R>,
    pageSize: number,
    maxPages: number,
    params: P,
    ctx: SimpleMap
  ) {
    super(onPage(callback, pageSize, ctx), maxPages, params, ctx);
  }
}
