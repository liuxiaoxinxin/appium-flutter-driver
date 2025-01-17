"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverShouldDoProxyCmd = exports.getContexts = exports.setContext = exports.getCurrentContext = exports.NATIVE_CONTEXT_NAME = exports.FLUTTER_CONTEXT_NAME = void 0;
exports.FLUTTER_CONTEXT_NAME = `FLUTTER`;
exports.NATIVE_CONTEXT_NAME = `NATIVE_APP`;
const getCurrentContext = async function () {
    return this.currentContext;
};
exports.getCurrentContext = getCurrentContext;
const setContext = async function (context) {
    if ([exports.FLUTTER_CONTEXT_NAME, exports.NATIVE_CONTEXT_NAME].includes(context)) {
        this.proxyWebViewActive = false;
        // Set 'native context' when flutter driver sets the context to FLUTTER_CONTEXT_NAME
        if (this.proxydriver) {
            await this.proxydriver.setContext(exports.NATIVE_CONTEXT_NAME);
        }
    }
    else {
        // this case may be 'webview'
        if (this.proxydriver) {
            await this.proxydriver.setContext(context);
            this.proxyWebViewActive = true;
        }
    }
    this.currentContext = context;
};
exports.setContext = setContext;
const getContexts = async function () {
    const nativeContext = await this.proxydriver.getContexts();
    return [...nativeContext, exports.FLUTTER_CONTEXT_NAME];
};
exports.getContexts = getContexts;
const driverShouldDoProxyCmd = function (command) {
    if (!this.proxydriver) {
        return false;
    }
    if (this.currentContext === exports.FLUTTER_CONTEXT_NAME) {
        return false;
    }
    if ([`getCurrentContext`, `setContext`, `getContexts`].includes(command)) {
        return false;
    }
    return true;
};
exports.driverShouldDoProxyCmd = driverShouldDoProxyCmd;
//# sourceMappingURL=context.js.map