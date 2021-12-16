import {
  Provide,
  Scope,
  Autoload,
  ScopeEnum,
  Init,
  Config,
  Logger,
} from '@midwayjs/decorator';
import {
  IAlertData,
  ISlackNotificationResult,
  IReqParams,
  ERRORTYPE,
} from '../interface';
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
  // rc-dog地址
  private rcDogUrl: string;
  // lark机器人地址
  private robotUrl: string;
  // larkSecret
  private robotSecret: string;
  // lark用户id
  private userId: string;

  @Init()
  async init() {
    this.rcDogUrl = this.endpoint['sec-rc-alert'];
    this.robotUrl = this.endpoint?.lark['robot'];
    this.robotSecret = this.endpoint?.lark['secret'];
    this.userId = this.endpoint?.lark['userId'];
  }

  async sendMsg(data: IAlertData) {
    if (!this.rcDogUrl || !this.robotUrl) {
      // 如果nacos中没有配置对应的slack信息，则不发送
      return;
    }
    const slackNotificationResult: ISlackNotificationResult = {
      application: this.applicationName,
      webhookUrl: this.robotUrl,
      requestId: data.requestId,
      message: data.message,
      ext: data.ext,
      timestamp: new Date().getTime(),
      title: data.title,
      level: data.level,
      larkSign: this.robotSecret,
      userId: this.userId,
    };
    try {
      //告警和错误日志，上报slack
      await this.sendMsgToSlack(this.rcDogUrl, slackNotificationResult);
    } catch (error) {
      // 避免一直出错，循环调用，使用info打印
      this.logger.error(ERRORTYPE.FRAMEERROR, '报警机器人发送消息错误');
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
