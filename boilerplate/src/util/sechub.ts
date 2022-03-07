import { decrypt } from 'sechub-sdk-node';

export async function decryptFromSechub(ciphertext: string, appConfSechub) {
  const { host, app_name, tls, sign_key } = appConfSechub;
  const remoteConfigStr = await decrypt(
    host,
    app_name,
    ciphertext,
    tls,
    sign_key
  );
  if (!remoteConfigStr) throw Error('sechub decrypt error...');
  return remoteConfigStr;
}
