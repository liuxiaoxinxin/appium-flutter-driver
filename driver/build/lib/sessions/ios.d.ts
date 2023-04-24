export declare const DRIVER_NAME = "XCUITest";
export declare const startIOSSession: (caps: any, ...args: any[]) => Promise<any[]>;
/**
 * Connect to the latest observaotry URL
 * @param androiddriver
 * @param caps
 * @returns current socket
 */
export declare const connectIOSSession: (iosdriver: any, caps: any) => Promise<[import("./isolate_socket").IsolateSocket | null]>;
export declare const getObservatoryWsUri: (proxydriver: any, caps: any) => Promise<any>;
//# sourceMappingURL=ios.d.ts.map