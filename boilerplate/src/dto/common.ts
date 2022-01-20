import { Rule, RuleType } from '@midwayjs/decorator';

export class CommonDTO {
  @Rule(RuleType.string().trim().max(100).required())
  requestId: string;
}
