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
import { decryptFromSo } from '../util/so';

@Scope(ScopeEnum.Singleton)
@Provide()
export class RemoteConfigService {
  @Config('nacos') private nacosConf;
  @Config('encryption') private encryptionConf;

  @App() private app: IMidwayApplication;
  @Init() protected async init(): Promise<void> {
    /** 初始化中间件配置 */
    const { nacosServer, nacosMiddleware, nacosApp } = this.nacosConf;
    const nacosMidClient = new NacosConfigClient(nacosServer.mid);
    const nacosAppClient = new NacosConfigClient(nacosServer.app);
    await nacosMidClient.ready();
    await nacosAppClient.ready();

    /** 初始化中间件配置 */
    const midConf = await nacosMidClient.getConfig(
      nacosMiddleware.dataId,
      nacosMiddleware.group
    );

    const useMidconf =
      this.encryptionConf.useSo === true
        ? await decryptFromSo(midConf, this.encryptionConf.soPwd)
        : midConf;

    this.app.addConfigObject({ ...JSON.parse(useMidconf) });

    /** 初始化应用配置 */
    const appConf = await nacosAppClient.getConfig(
      nacosApp.dataId,
      nacosApp.group
    );
    await this.app.addConfigObject({ ...JSON.parse(appConf) });
    /** 订阅变更 */
    if (nacosApp.subscribe) {
      nacosAppClient.subscribe(
        {
          dataId: nacosApp.dataId,
          group: nacosApp.group,
        },
        async content => {
          await this.app.addConfigObject({ ...JSON.parse(content) });
        }
      );
    }
  }
}
