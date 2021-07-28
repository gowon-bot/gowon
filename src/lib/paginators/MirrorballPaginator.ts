import { Paginator } from "./Paginator";

type MirrorballQueryFunction<P, R> = (params: P) => Promise<R>;

function onPage<P, R>(
  callback: MirrorballQueryFunction<P, R>,
  pageSize: number
): (params: P & { page?: number }) => Promise<R> {
  return (params) => {
    const newParams = Object.assign(params, {
      pageInput: {
        limit: pageSize,
        offset: pageSize * ((params.page || 1) - 1),
      },
    });

    delete newParams["page"];

    return Promise.resolve(callback(newParams));
  };
}

export class MirrorballPaginator<P, R> extends Paginator<P, R> {
  constructor(
    callback: MirrorballQueryFunction<P, R>,
    pageSize: number,
    maxPages: number,
    params: P
  ) {
    super(onPage(callback, pageSize), maxPages, params);
  }
}
