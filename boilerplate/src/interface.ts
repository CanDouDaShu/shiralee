/* eslint-disable @typescript-eslint/ban-types */
export enum ERRORTYPE {
  CHAINPARAMSERROR = '[002-001-P-001]: ',
  FRAMEERROR = '[002-002-M-007]: ',
  CHAINGENENALERROR = '[002-001-O-008]: ',
  CHAINDATAERROR = '[002-001-D-004]: ',
  CHAINANALYTICERROR = '[002-001-B-002]',
}

export interface ISlackconf {
  appHost: string;
  slackURI: string;
}

// 链上查询接口
export interface IChain {
  chain: string;
  coin: string;
  txHash: string;
  toAddress?: string;
  blockHash?: string;
  expandAll?: string;
  contractAddr?: string;
  requestId?: string;
}

/** 查链服务塞数据库接口 */
export interface ChainInfoToDB {
  chain: string;
  coin: string;
  createTime?: bigint;
  updateTime?: bigint;
}

export interface IChainConf {
  host: string;
  au_api_key?: string;
  dfuse_api_host?: string;
  username?: string;
  password?: string;
  port?: number;
  network?: string; // testnet or mainnet
}

export interface IChainInfo {
  toAddress: Array<string>;
  amount: Array<string | number>;
  timestamp: number;
  confirms: number;
  fromAddress: Array<string>;
  extraData?: Array<IExtra>;
  ifFromChainFlag?: boolean;
}
export interface IExtra {
  logIndex: number;
  fromAddress: string;
  toAddress: string;
  amount: string;
}
export interface IChainParams {
  iChain: IChain;
  iConfig: IChainConf;
}
export interface IReqParams {
  url: string;
  body?: object | string;
  headers?: object;
  contentType?: any;
  accept?: any;
  json?: boolean;
  get?: boolean;
}

export declare type SlackWarnLevel = 'info' | 'warn' | 'error';

export interface IAlertData {
  // 告警消息
  message?: string;
  // 请求id
  requestId?: any;
  // 告警消息标题
  title?: string;
  // 告警等级
  level?: SlackWarnLevel;
  // 扩展字段
  ext?: string;
}

export interface ISlackNotificationResult {
  // 告警URL
  webhookUrl: string;
  //报警应用
  application: string;
  // 告警等级（warn（警告），error（错误）），默认error级别
  level?: SlackWarnLevel;
  // 告警消息标题，默认  "异常告警"，长度限制（10）
  title?: string;
  // 报警时间
  timestamp?: number;
  // 通知用户ID
  userId?: string;
  // 请求id
  requestId?: string;
  // 服务名
  serviceName?: string;
  // 方法名
  methodName?: string;
  // 告警信息
  message?: string;
  // 额外信息
  ext?: string;
  // lark签名
  larkSign: string;
}

// skywalking的字段
export interface ILogDataApm {
  trace: string;
  span: string;
  sample?: string;
  parentTraceSegmentId?: string;
  parentService?: string;
  parentServiceInstance?: string;
  parentEndpoint?: string;
  destinationIpAndPort?: string;
}

export const LoggerName = 'artery-zil-microservice-log';

// 自由字段
export interface ILogDataExt {
  requestId?: string;
  traceId?: string;
  sw8?: ILogDataApm;
  methodName?: string;
  data?: string;
}
// log从参数中获取到的参数
export interface ILogData {
  // 消息
  M: string;
  // 时间戳
  T: string;
  // 日志等级
  L: SlackWarnLevel | 'debug';
  // 线程本身的信息
  self: ILogDataSelf;
  // 运行环境的信息
  host: ILogDataHost;
  // 返回
  rsp?: ILogDataRsp;
  // 以秒为单位，请求耗时
  duration?: number;
  // 请求
  req?: ILogDataReq;
  // skywalking的相关信息
  apm?: ILogDataApm;
  // 堆栈
  S?: string;
  // 自由字段
  ext?: ILogDataExt;
}

// 线程本身的信息
export interface ILogDataSelf {
  pid: number;
}
// 运行环境的信息
export interface ILogDataHost {
  name: string;
}
// 返回的信息
export interface ILogDataRsp {
  status: string;
  code: string;
  msg: string;
  param: string;
}
// 请求的信息
export interface ILogDataReq {
  path: string;
  method: string;
  ua: string;
  referer: string;
  rawhd: string;
  ip: string;
  param: string;
}
