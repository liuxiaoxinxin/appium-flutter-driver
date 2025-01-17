import { FlutterDriver } from '../driver';
export declare const FLUTTER_CONTEXT_NAME = "FLUTTER";
export declare const NATIVE_CONTEXT_NAME = "NATIVE_APP";
export declare const getCurrentContext: (this: FlutterDriver) => Promise<string>;
export declare const setContext: (this: FlutterDriver, context: string) => Promise<void>;
export declare const getContexts: (this: FlutterDriver) => Promise<any[]>;
export declare const driverShouldDoProxyCmd: (this: FlutterDriver, command: any) => boolean;
//# sourceMappingURL=context.d.ts.map