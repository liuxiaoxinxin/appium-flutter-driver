import { Client } from 'rpc-websockets';
export declare class IsolateSocket extends Client {
    isolateId: number | string;
    executeSocketCommand(cmd: any): Promise<{
        isError: boolean;
        response: any;
    }>;
}
//# sourceMappingURL=isolate_socket.d.ts.map