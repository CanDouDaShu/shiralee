import {
  App,
  Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';
import { NacosConfigClient } from 'nacos';

@Scope(ScopeEnum.Singleton)
@Provide()
export class RemoteConfigKey {
  @Config('nacosClient') private nacosConfig;
  @Config('isReadFromSo') private isReadFromSo;
  @App() private app: IMidwayApplication;
  @Init() protected async init(): Promise<void> {
    const { dataId, group } = this.nacosConfig;
    const nacosClient = new NacosConfigClient(this.nacosConfig);
    await nacosClient.ready();
    /** 业务nacos配置初始化 */
    await this.appAddConfig({
      nacosClient,
      dataId: dataId[0],
      group,
      flag: true,
    });
    /** 中间件nacos配置初始化并解密 */
    await this.appAddConfig({ nacosClient, dataId: dataId[1], group });
  }

  private async appAddConfig({
    nacosClient,
    dataId,
    group,
    flag = false,
  }): Promise<void> {
    const remoteConfigKey = await nacosClient.getConfig(dataId, group);
    if (this.isReadFromSo && !flag) {
      this.app.addConfigObject({ remoteConfigKey });
      return;
    }
    this.app.addConfigObject({
      ...(remoteConfigKey && JSON.parse(remoteConfigKey)),
    });
    if (flag) {
      nacosClient.subscribe(
        {
          dataId,
          group,
        },
        content => {
          console.log('subscribe new nacos config : ', content);
          this.app.addConfigObject({ ...(content && JSON.parse(content)) });
        }
      );
    }
  }
}
