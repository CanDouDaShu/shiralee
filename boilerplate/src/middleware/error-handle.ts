import { Provide, Logger } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
import { isEnv } from '../util/common';

@Provide()
export class ErrorHandlerMiddleware implements IWebMiddleware {
  @Logger()
  logger: ILogger;

  resolve() {
    return async (
      ctx: IMidwayKoaContext,
      next: IMidwayKoaNext
    ): Promise<void> => {
      try {
        await next();
        if (ctx.status === 404) {
          ctx.body = {
            success: false,
            status: 404,
            message: '[Shiralee] not found',
          };
        }
      } catch (error) {
        const { success = false, status = 500, message } = error;
        /** todo 需不需要在线上限制强刷 */
        const errorMessage =
          ctx.status === 500 && isEnv('prod')
            ? '[Shiralee] Internal Server Error'
            : message;
        ctx.body = { success, status, errorMessage };
      }
    };
  }
}
