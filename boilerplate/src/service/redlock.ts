import { Provide, Scope, ScopeEnum, Inject, Logger } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
const Redlock = require('redlock');
import { ILogger } from '@midwayjs/logger';
import { LoggerName } from '../interface';
/** 分布式锁类 */
@Scope(ScopeEnum.Singleton)
@Provide()
export class RedlockService {
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  redisClient: RedisService;
  redlockClient: any;
  async getRedlockClient() {
    if (!this.redlockClient) {
      /** 分布式锁单例懒汉式 */
      this.redlockClient = new Redlock([this.redisClient], {
        retryCount: 3,
        retryDelay: 100,
      });
    }
    return this.redlockClient;
  }
}
