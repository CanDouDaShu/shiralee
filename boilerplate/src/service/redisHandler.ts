import { Provide, Logger, Inject } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { LoggerName } from '../interface';
import { RedisService } from '@midwayjs/redis';
/**
 * redis缓层处理类
 */
@Provide()
export class RedisHandlerService {
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  redisService: RedisService;

  /** redis统一处理hmset */
  async handlerRedisHmset(...args): Promise<void> {
    await this.redisService.hmset(args[0], args[1], args[2]);
    if (!args[4]) {
      await this.redisService.persist(args[0]);
    } else {
      await this.redisService.expire(args[0], args[3]);
    }
  }

  /** redis统一处理hmget */
  async handlerRedisHmget(...args): Promise<string[]> {
    return this.redisService.hmget(args[0], args[1]);
  }

  /** todo redis 统一处理剩余所有函数 */
}
