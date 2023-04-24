export declare const DRIVER_NAME = "UIAutomator2";
export declare const startAndroidSession: (caps: any, ...args: any[]) => Promise<any[]>;
/**
 * Connect to the latest observaotry URL
 * @param androiddriver
 * @param caps
 * @returns current socket
 */
export declare const connectAndroidSession: (androiddriver: any, caps: any) => Promise<[import("./isolate_socket").IsolateSocket | null]>;
export declare const getObservatoryWsUri: (proxydriver: any, caps: any) => Promise<any>;
//# sourceMappingURL=android.d.ts.map