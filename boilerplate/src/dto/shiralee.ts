import { Rule, RuleType } from '@midwayjs/decorator';
import { CommonDTO } from './common';

@Rule(CommonDTO)
export class TransactionsDTO extends CommonDTO {
  @Rule(RuleType.string().trim().required().max(100))
  chain: string;

  @Rule(RuleType.string().trim().required().max(100))
  coin: string;

  @Rule(RuleType.string().trim().required().max(100))
  txHash: string;

  @Rule(RuleType.string().allow(null).allow('').max(100))
  blockHash: string;

  @Rule(RuleType.string().allow(null).allow('').max(1000))
  toAddress: string;

  @Rule(RuleType.string().allow(null).allow('').max(100))
  expandAll: string;
}
