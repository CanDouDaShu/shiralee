import {
  Configuration,
  App,
  Config,
  Logger,
  Inject,
} from '@midwayjs/decorator';
import * as orm from '@midwayjs/orm';
import * as bodyParser from 'koa-bodyparser';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import * as prometheus from '@midwayjs/prometheus';
// import agent from 'skywalking-backend-js';
import { createConnections } from 'typeorm';
import { ILogger } from '@midwayjs/logger';
import { join } from 'path';
import { ERRORTYPE } from './interface';
import * as redis from '@midwayjs/redis';
import * as cache from '@midwayjs/cache';
import { CacheManager } from '@midwayjs/cache';
import { RemoteConfigService } from './service/nacos';

/** 启动skywalking的agent */
// agent.start({
//   serviceName: process.env.SKYWALKING_SERVICE,
//   serviceInstance: process.env.SKYWALKING_INSTANCE,
//   collectorAddress: process.env.SKYWALKING_COLLECTOR,
//   disablePlugins: process.env.SKYWALKING_DISABLE_PLUGIN,
// });

@Configuration({
  conflictCheck: true,
  imports: [
    orm, // 加载typeorm
    prometheus, // 加载prometheus
    redis, // 加载redis
    cache, // 加载cache
  ],
  importConfigs: [join(__dirname, './config/')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @Logger()
  logger: ILogger;
  @App()
  app: Application;
  @Config('shiralee') private shiralee;
  @Config('endpoint') private endpoint;
  @Inject()
  cache: CacheManager; // 依赖注入CacheManager
  /** 容器加载配置时候导入nacos配置 */
  async onConfigLoad(container: IMidwayContainer) {
    await container.getAsync(RemoteConfigService);
  }
  async onReady() {
    if (!this.shiralee.orm) {
      throw new Error('orm配置缺失');
    }
    if (
      !this.endpoint ||
      !this.endpoint.lark ||
      !this.endpoint.lark.robot ||
      !this.endpoint.lark.secret ||
      !this.endpoint.lark.userId ||
      !this.endpoint['sec-rc-dog']
    ) {
      throw new Error('报警机器人配置缺失');
    }
    const newOrmConfig = [];
    this.shiralee.orm.map(
      item =>
        (item.entities = item.entities.map(it => join(__dirname, '../', it)))
    );
    this.shiralee.orm.forEach(async db => {
      newOrmConfig.push({ ...db, name: db.name });
    });
    await createConnections(newOrmConfig);
    this.app.use(await bodyParser());
    this.app.use(await this.app.generateMiddleware('errorHandlerMiddleware'));
    this.app.use(await this.app.generateMiddleware('performanceMiddleware'));
  }
  async onStop() {
    this.logger.error(ERRORTYPE.FRAMEERROR, '框架退出');
  }
}
