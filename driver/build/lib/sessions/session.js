"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.createSession = exports.reConnectFlutterDriver = void 0;
const logger_1 = require("../logger");
const android_1 = require("./android");
const ios_1 = require("./ios");
const reConnectFlutterDriver = async function (caps) {
    // setup proxies - if platformName is not empty, make it less case sensitive
    if (caps.platformName === null) {
        logger_1.log.errorAndThrow(`No platformName was given`);
    }
    const appPlatform = caps.platformName.toLowerCase();
    switch (appPlatform) {
        case `ios`:
            [this.socket] = await (0, ios_1.connectIOSSession)(this.proxydriver, caps);
            break;
        case `android`:
            [this.socket] = await (0, android_1.connectAndroidSession)(this.proxydriver, caps);
            break;
        default:
            logger_1.log.errorAndThrow(`Unsupported platformName: ${caps.platformName}`);
    }
};
exports.reConnectFlutterDriver = reConnectFlutterDriver;
// tslint:disable-next-line:variable-name
const createSession = async function (sessionId, caps, ...args) {
    try {
        // setup proxies - if platformName is not empty, make it less case sensitive
        if (caps.platformName !== null) {
            const appPlatform = caps.platformName.toLowerCase();
            switch (appPlatform) {
                case `ios`:
                    [this.proxydriver, this.socket] = await (0, ios_1.startIOSSession)(caps, ...args);
                    this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
                    this.proxydriver.denyInsecure = this.denyInsecure;
                    this.proxydriver.allowInsecure = this.allowInsecure;
                    this.proxydriverName = ios_1.DRIVER_NAME;
                    break;
                case `android`:
                    [this.proxydriver, this.socket] = await (0, android_1.startAndroidSession)(caps, ...args);
                    this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
                    this.proxydriver.denyInsecure = this.denyInsecure;
                    this.proxydriver.allowInsecure = this.allowInsecure;
                    this.proxydriverName = android_1.DRIVER_NAME;
                    break;
                default:
                    logger_1.log.errorAndThrow(`Unsupported platformName: ${caps.platformName}`);
            }
        }
        return [sessionId, this.opts];
    }
    catch (e) {
        await this.deleteSession();
        throw e;
    }
};
exports.createSession = createSession;
const deleteSession = async function () {
    logger_1.log.debug(`Deleting Flutter Driver session`);
    if (this.proxydriver !== null) {
        await this.proxydriver.deleteSession();
        this.proxydriver = null;
    }
};
exports.deleteSession = deleteSession;
//# sourceMappingURL=session.js.map