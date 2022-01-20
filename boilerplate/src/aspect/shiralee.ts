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
import { performance } from 'perf_hooks';
import { ShiraleeService } from '../service/shiralee';

@Provide()
@Aspect([ShiraleeService]) //todo 需要加入监听的类名
export class ReportInfo implements IMethodAspect {
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  ctx: Context;

  private functionTimeInterval: number;
  private functionTimeEnter: number;

  async before(point: JoinPoint) {
    this.functionTimeEnter = performance.now();
    const { requestId, traceId, methodName } = getIds(point);
    this.logger.info({ requestId, traceId, methodName }, { step: 'before' });
  }

  async after(point: JoinPoint, result, error) {
    this.functionTimeInterval = performance.now() - this.functionTimeEnter;
    const { requestId, traceId, methodName } = getIds(point);
    this.logger.info(
      { originArgs: [{ requestId, traceId, methodName }] },
      this.functionTimeInterval
    );
    if (error) {
      this.logger.error(error, {
        originArgs: [{ requestId, traceId, methodName }],
        step: 'after',
      });
      throw new Error(error.message);
    } else {
      this.logger.info(
        { originArgs: [{ requestId, traceId, methodName }] },
        JSON.stringify(result)
      );
    }
  }
}
