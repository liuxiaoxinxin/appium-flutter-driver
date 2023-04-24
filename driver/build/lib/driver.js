"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterDriver = void 0;
// @ts-ignore: no 'errors' export module
const driver_1 = require("appium/driver");
const logger_1 = require("./logger");
const ios_1 = require("./sessions/ios");
const observatory_1 = require("./sessions/observatory");
const session_1 = require("./sessions/session");
const context_1 = require("./commands/context");
const element_1 = require("./commands/element");
const execute_1 = require("./commands/execute");
const gesture_1 = require("./commands/gesture");
const screen_1 = require("./commands/screen");
const clipboard_1 = require("./commands/clipboard");
// Need to not proxy in WebView context
const WEBVIEW_NO_PROXY = [
    [`GET`, new RegExp(`^/session/[^/]+/appium`)],
    [`GET`, new RegExp(`^/session/[^/]+/context`)],
    [`GET`, new RegExp(`^/session/[^/]+/element/[^/]+/rect`)],
    [`GET`, new RegExp(`^/session/[^/]+/log/types$`)],
    [`GET`, new RegExp(`^/session/[^/]+/orientation`)],
    [`POST`, new RegExp(`^/session/[^/]+/appium`)],
    [`POST`, new RegExp(`^/session/[^/]+/context`)],
    [`POST`, new RegExp(`^/session/[^/]+/log$`)],
    [`POST`, new RegExp(`^/session/[^/]+/orientation`)],
    [`POST`, new RegExp(`^/session/[^/]+/touch/multi/perform`)],
    [`POST`, new RegExp(`^/session/[^/]+/touch/perform`)],
];
class FlutterDriver extends driver_1.BaseDriver {
    constructor(opts, shouldValidateCaps) {
        super(opts, shouldValidateCaps);
        this.socket = null;
        this.locatorStrategies = [`key`, `css selector`];
        // to handle WebView context
        this.proxyWebViewActive = false;
        // session
        this.executeElementCommand = observatory_1.executeElementCommand;
        this.executeGetVMCommand = observatory_1.executeGetVMCommand;
        this.executeGetIsolateCommand = observatory_1.executeGetIsolateCommand;
        this.execute = execute_1.execute;
        this.executeAsync = execute_1.execute;
        // element
        this.getText = element_1.getText;
        this.setValue = element_1.setValue;
        this.clear = element_1.clear;
        this.getScreenshot = screen_1.getScreenshot;
        this.getWindowSize = () => this.proxydriver.getWindowSize();
        // gesture
        this.click = gesture_1.click;
        this.longTap = gesture_1.longTap;
        this.tapEl = gesture_1.tapEl;
        this.tap = gesture_1.tap;
        this.performTouch = gesture_1.performTouch;
        // context
        this.getContexts = context_1.getContexts;
        this.getCurrentContext = context_1.getCurrentContext;
        this.setContext = context_1.setContext;
        this.currentContext = context_1.FLUTTER_CONTEXT_NAME;
        this.driverShouldDoProxyCmd = context_1.driverShouldDoProxyCmd;
        // content
        this.getClipboard = clipboard_1.getClipboard;
        this.setClipboard = clipboard_1.setClipboard;
        this.proxydriver = null;
        this.proxydriverName = ``;
        this.device = null;
        this.internalCaps = null;
    }
    async createSession(...args) {
        const [sessionId, caps] = await super.createSession(...JSON.parse(JSON.stringify(args)));
        this.internalCaps = caps;
        return session_1.createSession.bind(this)(sessionId, caps, ...JSON.parse(JSON.stringify(args)));
    }
    async deleteSession() {
        await Promise.all([
            session_1.deleteSession.bind(this)(),
            super.deleteSession(),
        ]);
    }
    async installApp(appPath, opts = {}) {
        this.proxydriver.installApp(appPath, opts);
    }
    async activateApp(appId) {
        this.proxydriver.activateApp(appId);
        await session_1.reConnectFlutterDriver.bind(this)(this.internalCaps);
    }
    async terminateApp(appId) {
        return await this.proxydriver.terminateApp(appId);
    }
    validateLocatorStrategy(strategy) {
        // @todo refactor DRY
        if (this.currentContext === `NATIVE_APP`) {
            return this.proxydriver.validateLocatorStrategy(strategy);
        }
        super.validateLocatorStrategy(strategy, false);
    }
    validateDesiredCaps(caps) {
        // check with the base class, and return if it fails
        const res = super.validateDesiredCaps(caps);
        if (!res) {
            return res;
        }
        // finally, return true since the superclass check passed, as did this
        return true;
    }
    async proxyCommand(url, method, body = null) {
        const result = await this.proxydriver.proxyCommand(url, method, body);
        return result;
    }
    async executeCommand(cmd, ...args) {
        if (cmd === `receiveAsyncResponse`) {
            logger_1.log.debug(`Executing FlutterDriver response '${cmd}'`);
            return await this.receiveAsyncResponse(...args);
        }
        else {
            if (this.driverShouldDoProxyCmd(cmd)) {
                logger_1.log.debug(`Executing proxied driver command '${cmd}'`);
                // There are 2 CommandTimeout (FlutterDriver and proxy)
                // Only FlutterDriver CommandTimeout is used; Proxy is disabled
                // All proxy commands needs to reset the FlutterDriver CommandTimeout
                // Here we manually reset the FlutterDriver CommandTimeout for commands that goe to proxy.
                this.clearNewCommandTimeout();
                const result = await this.proxydriver.executeCommand(cmd, ...args);
                this.startNewCommandTimeout();
                return result;
            }
            else {
                logger_1.log.debug(`Executing Flutter driver command '${cmd}'`);
                return await super.executeCommand(cmd, ...args);
            }
        }
    }
    getProxyAvoidList() {
        if ([context_1.FLUTTER_CONTEXT_NAME, context_1.NATIVE_CONTEXT_NAME].includes(this.currentContext)) {
            return [];
        }
        return WEBVIEW_NO_PROXY;
    }
    proxyActive() {
        // In WebView context, all request should got to each driver
        // so that they can handle http request properly.
        // On iOS, WebVie context is handled by XCUITest driver while Android is by chromedriver.
        // It means XCUITest driver should keep the XCUITest driver as a proxy,
        // while UIAutomator2 driver should proxy to chromedriver instead of UIA2 proxy.
        return this.proxyWebViewActive && this.proxydriverName !== ios_1.DRIVER_NAME;
    }
    canProxy() {
        // As same as proxyActive, all request should got to each driver
        // so that they can handle http request properly
        return this.proxyWebViewActive;
    }
}
exports.FlutterDriver = FlutterDriver;
//# sourceMappingURL=driver.js.map