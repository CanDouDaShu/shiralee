import {
  Provide,
  Scope,
  ScopeEnum,
  Config,
  Init,
  Autoload,
  Inject,
} from '@midwayjs/decorator';
import { loggers } from '@midwayjs/logger';
import { isObject, isString } from 'lodash';
import moment = require('moment');
import os = require('os');
import {
  ILogData,
  ILogDataApm,
  ILogDataExt,
  SlackWarnLevel,
  LoggerName,
} from '../interface';
import { AlertService } from './alert';

export type LoggerLevel = 'all' | 'debug' | 'info' | 'warn' | 'error' | 'none';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class LoggerService {
  @Config('logger')
  private loggerConfig;

  @Inject()
  alertService: AlertService;

  @Init()
  async init() {
    loggers.createLogger(LoggerName, {
      ...this.loggerConfig,
      printFormat: (info: any) => {
        return this.printFormat(info);
      },
    });
  }

  /** 系统基本信息采集 */
  private baseLogInfo(info: any): ILogData {
    const originArgs = info?.originArgs || [];
    const arg0 = originArgs[0];
    const arg1 = originArgs[1];
    return {
      T: moment(info.timestamp).toISOString(),
      L: info.level,
      self: {
        pid: info.pid,
      },
      host: {
        name: os.hostname(),
      },
      // 第一个字段如果是string则设置为message,
      // 第二个字段如果是string则设置为message,
      // 若有指定message的, 就展示改message
      M: isString(arg0) ? arg0 : isString(arg1) ? arg1 : info.message,
    };
  }

  /** 上下文信息采集 */
  private ctxLogInfo(info) {
    const originArgs = info?.originArgs || [];
    const arg0 = originArgs[0];
    let data = {};
    const logData = {};
    let requestId: string;
    if (isObject(arg0)) {
      // 第一个字段如果是Object，从中获取requestId
      data = arg0;
      requestId = arg0['requestId'];
    }
    // 通过链路上下文调用的，处理请求和返回
    const ctx = info.ctx;
    if (ctx) {
      const req = ctx.request;
      const header = req.header;
      const res = ctx.response;
      if (data['type'] === 'response') {
        logData['rsp'] = {
          status: res.status,
          code: res.code,
          msg: res.message,
          param: res.body,
        };
        // 以秒为单位，传入前就应该处理好
        if (data['duration']) {
          logData['duration'] = data['duration'];
        }
      } else {
        logData['req'] = {
          path: req.url,
          method: req.method,
          ua: header['user-agent'],
          referer: header['referer'],
          rawhd: header,
          ip: this.getClientIP(ctx.req),
          param: { ...req.query, ...req.body },
        };
        if (!requestId) {
          requestId = header['x-request-id'] || req.query?.requestId;
        }
      }
    }
    return logData;
  }

  /** skywalking信息上报 */
  private skywalkingInfo(ctx) {
    const logData = {};
    if (ctx) {
      const sw8 = ctx?.req?.header['sw8'];
      if (sw8) {
        logData['apm'] = this.getApmInfo(sw8);
      }
    }
    return logData;
  }

  /** 堆栈信息上报 */
  private stackInfo(info) {
    const logData = {};
    const arg0 = (info?.originArgs || [])[0];
    let data = {};
    if (isObject(arg0)) {
      data = arg0;
    }
    const stack = info.stack || data['stack'] || info.message;
    if (stack) {
      logData['S'] = stack;
    }
    return logData;
  }

  /** elk数据上报 */
  private elkInfo(info) {
    const originArgs = info?.originArgs || [];
    const arg0 = originArgs[0];
    let requestId: string;
    let traceId: string;
    let methodName: string;
    const sw8 = this.sw8(info.ctx?.req?.header['sw8']);
    const logData = {};
    if (isObject(arg0)) {
      requestId = arg0['requestId'];
      traceId = arg0['traceId'];
      methodName = arg0['methodName'];
    }
    const ext: ILogDataExt = {
      requestId,
      traceId,
      sw8,
      methodName,
      data: '',
    };
    if (originArgs) {
      let extStr: string;
      try {
        extStr = JSON.stringify(originArgs);
      } catch (error) {
        extStr = `无法解析成json的数据, error: ${error}`;
      }
      ext.data = extStr;
    }
    logData['ext'] = ext;
    return logData;
  }

  /** 模版数据格式化 */
  private getLogData(info: any): ILogData {
    /** 系统基本数据格式化 */
    let logData: ILogData = this.baseLogInfo(info);
    /** 请求链上下文数据格式化 */
    logData = { ...logData, ...this.ctxLogInfo(info) };
    /** skywalking数据格式化 */
    logData = { ...logData, ...this.skywalkingInfo(info.ctx) };
    /** 堆栈数据格式化 */
    logData = { ...logData, ...this.stackInfo(info) };
    /** elk数据格式化 */
    logData = { ...logData, ...this.elkInfo(info) };
    return logData;
  }

  /** 渲染数据 */
  private renderLog(data: ILogData): string {
    return JSON.stringify(data).replace(/\\n/g, ''); // 将换行符替换成空
  }

  /** midway自定义格式化日志体系 */
  private printFormat(info: any) {
    // 从info中获取对应的data信息
    const data = this.getLogData(info);
    // 指定的告警，发送到slack
    if (this.loggerConfig?.slackLevel.includes(data.L)) {
      this.alertService.sendMsg({
        requestId: data.ext.requestId,
        message: data.M,
        level: data.L as SlackWarnLevel,
        ext: JSON.stringify({
          level: data.L,
          ...data.ext,
        }),
      });
    }
    // 渲染log data
    const log = this.renderLog(data);
    return log;
  }

  private getClientIP(req) {
    return (
      req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection?.remoteAddress || // 判断 connection 的远程 IP
      req.socket?.remoteAddress || // 判断后端的 socket 的 IP
      req.connection?.socket?.remoteAddress
    );
  }

  private getApmInfo(sw8: string): ILogDataApm {
    // https://github.com/apache/skywalking/blob/master/docs/en/protocols/Skywalking-Cross-Process-Propagation-Headers-Protocol-v3.md
    const items = (sw8 || '').split('-');
    return {
      trace: Buffer.from(items[1], 'base64').toString(),
      span: items[3],
    };
  }

  private sw8(sw8: string): ILogDataApm {
    if (sw8) {
      const items = (sw8 || '').split('-');
      /** 0 或 1. 0 表示上下文存在, 但是可以(也很可能)忽略. 1 表示此追踪需要采样并发送到后端 */
      const sample = items[0];
      /** 字符串(BASE64 编码). 由 . 分割的三个 long 类型值, 表示此追踪的唯一标识. */
      const trace = Buffer.from(items[1], 'base64').toString();
      /** 父追踪段 ID(Parent trace segment Id). 字符串(BASE64 编码). 字符串且全局唯一. */
      const parentTraceSegmentId = Buffer.from(items[2], 'base64').toString();
      /** 父 Span 标识. 整数. 从 0 开始. 此 Span ID 指向了父追踪段中的 Span. */
      const span = items[3];
      /** 父服务. 字符串(BASE64 编码). 长度不应小于或等于50个UTF-8编码的字符. */
      const parentService = Buffer.from(items[4], 'base64').toString('utf-8');
      /** 父服务实例标识. 字符串(BASE64 编码). 长度不应小于或等于50个UTF-8编码的字符. */
      const parentServiceInstance = Buffer.from(items[5], 'base64').toString(
        'utf-8'
      );
      /** 父服务的端点. 字符串(BASE64 编码). 父追踪段中第一个入口span的操作名. 长度不应小于或等于50个UTF-8编码的字符. */
      const parentEndpoint = Buffer.from(items[6], 'base64').toString('utf-8');
      /** 本请求的目标地址. 字符串(BASE64 编码). 客户端用于访问目标服务的网络地址(不一定是 IP + 端口). */
      const destinationIpAndPort = Buffer.from(items[7], 'base64').toString();
      return {
        sample,
        trace,
        parentTraceSegmentId,
        span,
        parentService,
        parentServiceInstance,
        parentEndpoint,
        destinationIpAndPort,
      };
    }
  }
}
