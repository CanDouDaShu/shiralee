/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import BigNumber from 'bignumber.js';
BigNumber.config({ EXPONENTIAL_AT: 64 });
import { Provide, Inject, Config, Logger } from '@midwayjs/decorator';
import { RedisHandlerService } from './redisHandler';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { ChainCoinInfo } from '../entity/mysql/bybit_taie/ChainCoinInfo';
import { ILogger } from '@midwayjs/logger';
import { CacheManager } from '@midwayjs/cache';
import { LoggerName, ChainInfoToDB } from '../interface';
import { Context } from '@midwayjs/koa';
import { DbHandlerService } from './dbHandler';

/**
 * 缓存限制直接查链数据Shiralee类
 */
@Provide()
export class ShiraleeService {
  @Inject()
  redisHandlerService: RedisHandlerService;
  @Inject()
  dbHandlerService: DbHandlerService;
  @Config('zil')
  zilConfig;
  @InjectEntityModel(ChainCoinInfo, 'bybit_taie')
  chainCoinInfo: Repository<ChainCoinInfo>;
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  cache: CacheManager; // 依赖注入CacheManager
  @Inject()
  ctx: Context;

  /** 数据库统一处理例子 */
  async handlerInsertDB(chainInfoToDB: ChainInfoToDB): Promise<void> {
    try {
      await this.dbHandlerService.handlerDB(
        async (...args) => {
          await args[0]
            .createQueryBuilder()
            .insert()
            .values(args[1])
            .orUpdate({
              conflict_target: ['id', 'chain', 'coin'],
              overwrite: ['update_time'],
            })
            .updateEntity(false)
            .execute();
        },
        this.chainCoinInfo,
        chainInfoToDB
      );
    } catch (error) {
      this.logger.error(error, '处理链数据入库出现错误');
      throw new Error(error.message);
    }
  }
}
