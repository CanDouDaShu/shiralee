import {
  Controller,
  Post,
  Provide,
  ALL,
  Body,
  Validate,
  Inject,
  Logger,
} from '@midwayjs/decorator';
import { ShiraleeService } from '../service/shiralee';
import { Context } from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
import { LoggerName } from '../interface';
import { TransactionsDTO } from '../dto/shiralee';

@Provide()
@Controller('/chain')
export class ShiraleeController {
  @Inject()
  shiraleeService: ShiraleeService;
  @Logger(LoggerName)
  logger: ILogger;
  @Inject()
  ctx: Context;
  @Post('/transactions')
  @Validate()
  async findTransactions(@Body(ALL) params: TransactionsDTO) {
    let result;
    try {
      result = await this.shiraleeService.handlerInsertDB(params);
    } catch (error) {
      this.logger.error(error, '控制器错误');
      throw new Error(error.message);
    }
    return {
      success: true,
      message: '',
      result,
    };
  }
}
