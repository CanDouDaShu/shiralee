import { Provide, Logger } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
import { performance } from 'perf_hooks';

@Provide()
export class PerformanceMiddleware implements IWebMiddleware {
  @Logger()
  logger: ILogger;

  resolve() {
    return async (
      ctx: IMidwayKoaContext,
      next: IMidwayKoaNext
    ): Promise<void> => {
      const start = performance.now();
      await next();
      const end = performance.now();
      this.logger.info('接口总耗时: ', `${end - start}ms`);
    };
  }
}
