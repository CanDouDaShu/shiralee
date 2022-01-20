/* eslint-disable prefer-const */
import { parseInt } from 'lodash';

const envMap = {
  production: 'prod',
  test: 'test',
  local: 'local',
  testnet: 'testnet',
};
export function isEnv(...args: string[]) {
  let env = process.env.NODE_ENV;
  env = envMap[env] || env;
  return [...args].includes(env);
}

export function getApmInfo(sw8: string) {
  const items = (sw8 || '').split('-');
  return {
    traceid: Buffer.from(items[1], 'base64').toString(),
  };
}

export function getIds(point) {
  let requestId = point.args[0]?.requestId;
  if (!requestId) {
    requestId =
      point.args[0]?.request?.header['x-request-id'] ||
      point.args[0]?.request?.query?.requestId;
  }
  const sw8 = point.args[0]?.request?.header['sw8'];
  let apm;
  if (sw8) {
    apm = getApmInfo(sw8);
    return {
      requestId,
      traceId: apm.traceid,
      target: point.target,
      methodName: point.methodName,
    };
  }

  return {
    requestId,
    traceId: undefined,
    target: point.target,
    methodName: point.methodName,
  };
}

export function getMidTrigger({ total, visitTimes }) {
  const midTiggerArr = [];
  const diviseResult = parseInt((total / visitTimes).toFixed(2));
  let count = 1;
  /** 将中间阶段trigger具体数字排列出来 */
  while (midTiggerArr[midTiggerArr.length - 1] + diviseResult <= total) {
    midTiggerArr.push(count + midTiggerArr.length * diviseResult);
  }
  /** 这里主要是主动修复将可能由于除不尽带来的最后一次不是落在total的问题 */
  midTiggerArr[midTiggerArr.length - 1] = total;
  return midTiggerArr;
}
