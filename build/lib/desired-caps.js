"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.desiredCapConstraints = void 0;
exports.desiredCapConstraints = {
    app: {
        isString: true,
    },
    automationName: {
        inclusionCaseInsensitive: [`Flutter`],
        isString: true,
        presence: true,
    },
    avd: {
        isString: true,
    },
    maxRetryCount: {
        isNumber: true,
    },
    platformName: {
        inclusionCaseInsensitive: [
            `iOS`,
            `Android`,
        ],
        isString: true,
        presence: true,
    },
    retryBackoffTime: {
        isNumber: true,
    },
    udid: {
        isString: true,
    },
    observatoryWsUri: {
        isString: true,
    },
    skipPortForward: {
        isBoolean: true
    }
};
//# sourceMappingURL=desired-caps.js.map