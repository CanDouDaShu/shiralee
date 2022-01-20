/* eslint-disable @typescript-eslint/no-unused-vars */
const WebFramework = require('@midwayjs/koa').Framework;
const path = require('path');
const fs = require('fs');
const createKoaweb = function (config) {
  return new WebFramework().configure({
    port: config.port || 7001,
  });
};
const { Bootstrap } = require('@midwayjs/bootstrap');
let web;
// 加载所有js文件-解决路由丢失问题
const getFiles = function (dir, list = []) {
  const arr = fs.readdirSync(dir);
  while (arr.length) {
    const item = arr.pop();
    const fullpath = path.join(dir, item);
    const stats = fs.statSync(fullpath);
    if (!stats.isDirectory()) {
      if (/\.js$/.test(fullpath)) list.push(require(fullpath));
    } else {
      getFiles(fullpath, list);
    }
  }
  return list;
};
Bootstrap.before(async container => {
  // 读取远程配置
  web = createKoaweb(container.getConfigService().getConfiguration());
})
  .configure({
    baseDir: path.join(__dirname, '/dist'),
    preloadModules: getFiles(path.join(__dirname, '/dist')),
  })
  .load(() => {
    return web;
  })
  .run();
