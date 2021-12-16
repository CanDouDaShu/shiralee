import { Configuration, App, Logger } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import * as prometheus from '@midwayjs/prometheus';
import agent from 'skywalking-backend-js';
import { ILogger } from '@midwayjs/logger';
import { join } from 'path';
import { ERRORTYPE } from './interface';

// skywalking的agent启动方式
agent.start({
  serviceName: process.env.SKYWALKING_SERVICE,
  serviceInstance: process.env.SKYWALKING_INSTANCE,
  collectorAddress: process.env.SKYWALKING_COLLECTOR,
  disablePlugins: process.env.SKYWALKING_DISABLE_PLUGIN,
});

@Configuration({
  conflictCheck: true,
  imports: [
    prometheus, // 加载prometheus
  ],
  importConfigs: [join(__dirname, './config/')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @Logger()
  logger: ILogger;
  @App()
  app: Application;
  async onReady() {
    this.app.use(await bodyParser());
    this.app.use(await this.app.generateMiddleware('errorHandlerMiddleware'));
  }
  async onStop() {
    this.logger.error(ERRORTYPE.FRAMEERROR, '框架退出');
  }
}
