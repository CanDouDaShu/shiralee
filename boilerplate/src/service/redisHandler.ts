import { Provide, Logger, Inject } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { LoggerName } from '../interface';
import { RedisService } from '@midwayjs/redis';
/**
 * 简单代理模式处理redis操作
 */
@Provide()
export class RedisHandlerService {
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  redisService: RedisService;

  /** 代理redisClient */
  async proxyRedisClient(): Promise<any> {
    return this.redisService;
  }

  /** redis统一处理hmset */
  async handlerRedisHmset(...args): Promise<void> {
    await this.redisService.hmset(args[0], args[1], args[2]);
    if (args[4]) {
      await this.redisService.persist(args[0]);
    } else {
      await this.redisService.expire(args[0], args[3]);
    }
  }

  /** redis统一处理hmget */
  async handlerRedisHmget(...args): Promise<string[]> {
    return this.redisService.hmget(args[0], args[1]);
  }

  /** redis统一处理lpush */
  async handlerRedisLpush(...args): Promise<number> {
    /** todo 设置过期时间 */
    return this.redisService.lpush(args[0], args[1]);
  }

  /** redis统一处理lpush */
  async handlerRedisLpushx(...args): Promise<number> {
    /** todo 设置过期时间 */
    return this.redisService.lpushx(args[0], args[1]);
  }

  /** redis统一处理lpop */
  async handlerRedisRpop(...args): Promise<string> {
    return this.redisService.rpop(args[0]);
  }

  /** redis统一处理llen */
  async handlerRedisLlen(...args): Promise<number> {
    return this.redisService.llen(args[0]);
  }

  /** redis统一处理lrange */
  async handlerRedisLrange(...args): Promise<string[]> {
    return this.redisService.lrange(args[0], args[1], args[2]);
  }
}
