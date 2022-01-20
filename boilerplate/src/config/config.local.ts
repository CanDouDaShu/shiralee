export default {
  nacos: {
    nacosServer: {
      mid: {
        serverAddr: '192.168.57.101:8848',
        namespace: 'public',
      },
      app: {
        serverAddr: '192.168.57.101:8848',
        namespace: 'public',
      },
    },
    nacosMiddleware: {
      group: 'shiralee',
      dataId: 'shiralee-middleware',
      subscribe: false,
    },
    nacosApp: {
      group: 'shiralee',
      dataId: 'shiralee-busness',
      subscribe: true,
    },
  },
  encryption: {
    useSo: false,
    soPwd: './so/*',
  },
  redis: {
    client: {
      port: 6379,
      host: '192.168.57.101',
      password: '',
      db: 0,
      prefix: 'argus:artery:',
    },
  },
  endpoint: {
    lark: {
      robot:
        'https://shiralee',
      secret: 'shiralee',
      userId: 'shiralee',
    },
    'sec-rc-dog': 'http://shiralee:8080',
  },
  shiralee: {
    orm: [
      {
        host: '192.168.57.101',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'bybit_taie',
        synchroniz: false,
        logging: false,
        type: 'mysql',
        name: 'bybit_taie',
        entities: ['./dist/entity/mysql/bybit_taie/*{.js,.ts}'],
      },
    ],
  },
};
