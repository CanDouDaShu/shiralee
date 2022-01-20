const ffi = require('ffi-napi');
const path = require('path');
const base64 = require('base-64');
const StructType = require('ref-struct-napi');

const GoString = StructType({
  p: 'string', // pointer
  n: 'longlong', // length
});
const newGoString = function (str) {
  return new GoString({ p: str, n: str.length });
};

export async function decryptFromSo(ciphertext: string, soPwd) {
  try {
    const [data, key] = base64.decode(ciphertext).split(',');
    const libm = ffi.Library(path.join(process.cwd(), soPwd), {
      TKS: ['string', [GoString, GoString, GoString]],
    });
    // 获取soConfig
    const secStr = libm.TKS(
      newGoString('sec_code'),
      newGoString(data),
      newGoString(key)
    );
    return secStr;
  } catch (err) {
    console.log('so解密nacos中间件配置出现错误: ', err);
    throw new Error(err.message);
  }
}
