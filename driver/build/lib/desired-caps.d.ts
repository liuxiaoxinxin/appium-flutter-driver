export interface IDesiredCapConstraints {
    deviceName?: string;
    platformName: {
        presence: boolean;
        isString: boolean;
        inclusionCaseInsensitive: string[];
    };
    automationName: {
        presence: boolean;
        isString: boolean;
        inclusionCaseInsensitive: string[];
    };
    app: any;
    avd: any;
    udid: any;
    retryBackoffTime: any;
    maxRetryCount: any;
    observatoryWsUri: {
        isString: boolean;
    };
    skipPortForward: {
        isBoolean: boolean;
    };
}
export declare const desiredCapConstraints: IDesiredCapConstraints;
//# sourceMappingURL=desired-caps.d.ts.map