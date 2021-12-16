import {
  Aspect,
  IMethodAspect,
  JoinPoint,
  Provide,
  Logger,
  Inject,
} from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { getIds } from '../util/common';
import { Context } from '@midwayjs/koa';
import { LoggerName } from '../interface';

@Provide()
@Aspect([]) // todo 加入需要AOP的类名
export class ReportInfo implements IMethodAspect {
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  ctx: Context;

  async before(point: JoinPoint) {
    const { requestId, traceId, methodName } = getIds(point);
    this.logger.info({ requestId, traceId, methodName }, 'before');
  }

  async after(point: JoinPoint, result, error) {
    const { requestId, traceId, methodName } = getIds(point);
    if (error) {
      this.logger.warn(
        { requestId, traceId, methodName },
        JSON.stringify(error)
      );
      return;
    }
    this.logger.info(
      { requestId, traceId, methodName },
      JSON.stringify(result)
    );
  }

  async afterThrow(point: JoinPoint, error) {
    const { requestId, traceId, methodName } = getIds(point);
    this.logger.error(
      { requestId, traceId, methodName },
      JSON.stringify(error)
    );
  }
}
