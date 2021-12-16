/* eslint-disable @typescript-eslint/no-unused-vars */
const WebFramework = require('@midwayjs/koa').Framework;
const path = require('path');
const createKoaweb = function (config) {
  return new WebFramework().configure({
    port: config.port || 7001,
  });
};
const { Bootstrap } = require('@midwayjs/bootstrap');
let web, config;
Bootstrap.before(async container => {
  // 读取远程配置
  config = container.getConfigService().getConfiguration();
  web = createKoaweb(config);
  await container.getAsync('remoteConfigKey');
  await container.getAsync('remoteConfig');
  // todo 通过config配置的exclude过滤cache中存储的全量class
})
  .configure({
    baseDir: path.join(__dirname, '/dist'),
  })
  .load(web)
  .run();
