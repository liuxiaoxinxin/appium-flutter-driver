import { FlutterDriver } from '../driver';

export const getScreenshot = async function(this: FlutterDriver) {
  if (this.proxydriverName === 'NATIVE_APP') {
    return this.proxydriver.getScreenshot();
  }
  const response = await this.socket!.call(`_flutter.screenshot`) as any;
  return response.screenshot;
};
