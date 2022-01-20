import { Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { LoggerName } from '../interface';
/**
 * 数据层处理类
 */
@Provide()
export class DbHandlerService {
  @Logger(LoggerName)
  logger: ILogger;

  /** 处理数据层所有逻辑的统一函数
   * args 1. Function()
   *      2. model
   *      3. 参数
   */
  async handlerDB(...args): Promise<any> {
    return args[0](args[1], args[2]);
  }
}
