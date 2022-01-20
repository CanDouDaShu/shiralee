import {
  Provide,
  Scope,
  Autoload,
  ScopeEnum,
  Config,
  Logger,
} from '@midwayjs/decorator';
import { IAlertData, ISlackNotificationResult, IReqParams } from '../interface';
import { requestApi } from '../util/request';
import { ILogger } from '@midwayjs/logger';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class AlertService {
  @Config('endpoint')
  private endpoint;
  @Config('applicationName')
  private applicationName;

  @Logger()
  logger: ILogger;

  async sendMsg(data: IAlertData) {
    const slackNotificationResult: ISlackNotificationResult = {
      application: this.applicationName,
      webhookUrl: this.endpoint.lark['robot'],
      requestId: data.requestId,
      message: data.message,
      ext: data.ext,
      timestamp: new Date().getTime(),
      title: data.title,
      level: data.level,
      larkSign: this.endpoint.lark['secret'],
      userId: this.endpoint.lark['userId'],
    };
    try {
      //告警和错误日志，上报slack
      await this.sendMsgToSlack(
        this.endpoint['sec-rc-dog'],
        slackNotificationResult
      );
    } catch (error) {
      // 避免一直出错，循环调用
      this.logger.error(error, '上报lark报警机器人出现错误');
    }
  }

  async sendMsgToSlack(
    host: string,
    slackNotificationResult: ISlackNotificationResult
  ) {
    const params: IReqParams = {
      url: `${host}/risk/sec/v1.0/slackMessageAlarm`,
      body: slackNotificationResult,
      headers: { 'Content-Type': 'application/json' },
      json: true,
    };
    return requestApi(params, false);
  }
}
