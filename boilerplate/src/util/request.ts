import request = require('request');
import { IReqParams } from '../interface';
/**
 * 请求API接口统一入口
 * @param params
 * @returns
 */
export function requestApi(params: IReqParams, get?: boolean): any {
  const method = get ? 'GET' : 'POST';
  return new Promise((resolve, reject) => {
    request(
      {
        method: method,
        ...params,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res.body);
      }
    );
  });
}
