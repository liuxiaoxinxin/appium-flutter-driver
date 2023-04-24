/// <reference types="node" />
import { URL } from 'url';
import { FlutterDriver } from '../driver';
import { IsolateSocket } from './isolate_socket';
export declare const connectSocket: (getObservatoryWsUri: any, driver: any, caps: any) => Promise<IsolateSocket | null>;
export declare const executeGetIsolateCommand: (this: FlutterDriver, isolateId: string | number) => Promise<unknown>;
export declare const executeGetVMCommand: (this: FlutterDriver) => Promise<{
    isolates: [
        {
            name: string;
            id: number;
        }
    ];
}>;
export declare const executeElementCommand: (this: FlutterDriver, command: string, elementBase64?: string, extraArgs?: {}) => Promise<any>;
export declare const processLogToGetobservatory: (deviceLogs: [{
    message: string;
}]) => URL;
//# sourceMappingURL=observatory.d.ts.map