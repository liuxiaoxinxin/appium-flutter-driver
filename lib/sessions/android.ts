import { androidHelpers } from 'appium-android-driver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
export const DRIVER_NAME = `UIAutomator2`;

// @ts-ignore
import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
const setupNewAndroidDriver = async (...args) => {
  const androidArgs = {
    javascriptEnabled: true,
  };
  const androiddriver = new AndroidUiautomator2Driver(androidArgs);
  await androiddriver.createSession(...args);

  return androiddriver;
};

export const startAndroidSession = async (caps, ...args) => {
  log.info(`Starting an Android proxy session`);
  const androiddriver = await setupNewAndroidDriver(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.appPackage === undefined) {
    return [androiddriver, null];
  }

  return Promise.all([
    androiddriver,
    connectSocket(getObservatoryWsUri, androiddriver, caps),
  ]);

};

/**
 * Connect to the latest observaotry URL
 * @param androiddriver
 * @param caps
 * @returns current socket
 */
export const connectAndroidSession = async (androiddriver, caps) => {
  return Promise.all([
    connectSocket(getObservatoryWsUri, androiddriver, caps),
  ]);
};

export const getObservatoryWsUri = async (proxydriver , caps) => {
  let urlObject;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }

  } else {
    urlObject = processLogToGetobservatory(proxydriver.adb.logcat.logs);
  }
  const {udid} = await androidHelpers.getDeviceInfoFromCaps(caps);
  log.debug(
    `${proxydriver.adb.executable.path} -s ${udid} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );
  await execPromise(
    `${proxydriver.adb.executable.path} -s ${udid} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );

  return urlObject.toJSON();
};
