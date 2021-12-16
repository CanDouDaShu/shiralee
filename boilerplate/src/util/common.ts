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
