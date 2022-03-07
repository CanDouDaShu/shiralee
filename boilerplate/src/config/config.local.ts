export default {
  nacos: {
    nacosServer: {
      mid: {
        serverAddr: '192.168.57.72:8848',
        namespace: 'public',
      },
      app: {
        serverAddr: '192.168.57.72:8848',
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
    useSechub: false,
    sechub: {},
  },
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
      prefix: 'argus:artery:',
    },
  },
  endpoint: {
    lark: {
      robot: 'https://shiralee',
      secret: 'shiralee',
      userId: 'shiralee',
    },
    'sec-rc-dog': 'http://shiralee:8080',
  },
  shiralee: {
    orm: [
      {
        host: '192.168.57.72',
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
