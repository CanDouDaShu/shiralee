import path = require('path');
import os = require('os');
const logDir = path.join(process.cwd(), './logs/');
const hostname = os.hostname();

export default {
  keys: 'candoudashu19960816',
  applicationName: 'bybit',
  security: {
    csrf: {
      enable: false,
    },
  },
  cache: {
    store: 'memory',
    options: {
      max: 100, // 防爆
      ttl: 3600, // 修改默认的ttl配置
    },
  },
  logger: {
    dir: logDir,
    errorDir: logDir,
    level: 'info',
    errorLogName: `${hostname}_error.log`,
    fileLogName: `${hostname}_server.log`,
    disableConsole: false,
    disableFile: true,
    disableError: true,
    slackLevel: ['warn', 'error'],
  },
};
