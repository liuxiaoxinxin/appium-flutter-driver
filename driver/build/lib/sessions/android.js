"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservatoryWsUri = exports.connectAndroidSession = exports.startAndroidSession = exports.DRIVER_NAME = void 0;
const appium_android_driver_1 = require("appium-android-driver");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
exports.DRIVER_NAME = `UIAutomator2`;
// @ts-ignore
const appium_uiautomator2_driver_1 = __importDefault(require("appium-uiautomator2-driver"));
const logger_1 = require("../logger");
const observatory_1 = require("./observatory");
const setupNewAndroidDriver = async (...args) => {
    const androidArgs = {
        javascriptEnabled: true,
    };
    const androiddriver = new appium_uiautomator2_driver_1.default(androidArgs);
    await androiddriver.createSession(...args);
    return androiddriver;
};
const startAndroidSession = async (caps, ...args) => {
    logger_1.log.info(`Starting an Android proxy session`);
    const androiddriver = await setupNewAndroidDriver(...args);
    // the session starts without any apps
    if (caps.app === undefined && caps.appPackage === undefined) {
        return [androiddriver, null];
    }
    return Promise.all([
        androiddriver,
        (0, observatory_1.connectSocket)(exports.getObservatoryWsUri, androiddriver, caps),
    ]);
};
exports.startAndroidSession = startAndroidSession;
/**
 * Connect to the latest observaotry URL
 * @param androiddriver
 * @param caps
 * @returns current socket
 */
const connectAndroidSession = async (androiddriver, caps) => {
    return Promise.all([
        (0, observatory_1.connectSocket)(exports.getObservatoryWsUri, androiddriver, caps),
    ]);
};
exports.connectAndroidSession = connectAndroidSession;
const getObservatoryWsUri = async (proxydriver, caps) => {
    let urlObject;
    if (caps.observatoryWsUri) {
        urlObject = new URL(caps.observatoryWsUri);
        urlObject.protocol = `ws`;
        // defaults to skip the port-forwarding as backward compatibility
        if (caps.skipPortForward === undefined || caps.skipPortForward) {
            return urlObject.toJSON();
        }
    }
    else {
        urlObject = (0, observatory_1.processLogToGetobservatory)(proxydriver.adb.logcat.logs);
    }
    const { udid } = await appium_android_driver_1.androidHelpers.getDeviceInfoFromCaps(caps);
    logger_1.log.debug(`${proxydriver.adb.executable.path} -s ${udid} forward tcp:${urlObject.port} tcp:${urlObject.port}`);
    await execPromise(`${proxydriver.adb.executable.path} -s ${udid} forward tcp:${urlObject.port} tcp:${urlObject.port}`);
    return urlObject.toJSON();
};
exports.getObservatoryWsUri = getObservatoryWsUri;
//# sourceMappingURL=android.js.map