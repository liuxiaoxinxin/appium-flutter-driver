"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLogToGetobservatory = exports.executeElementCommand = exports.executeGetVMCommand = exports.executeGetIsolateCommand = exports.connectSocket = void 0;
const url_1 = require("url");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../logger");
const isolate_socket_1 = require("./isolate_socket");
const base64url_1 = require("./base64url");
const truncateLength = 500;
// SOCKETS
const connectSocket = async (getObservatoryWsUri, driver, caps) => {
    const retryBackoff = caps.retryBackoffTime || 3000;
    const maxRetryCount = caps.maxRetryCount || 30;
    let retryCount = 0;
    let connectedSocket = null;
    while (retryCount < maxRetryCount && !connectedSocket) {
        if (retryCount > 0) {
            logger_1.log.info(`Waiting ` + retryBackoff / 1000 + ` seconds before trying...`);
            await new Promise((r) => setTimeout(r, retryBackoff));
        }
        logger_1.log.info(`Attempt #` + (retryCount + 1));
        let dartObservatoryURL;
        try {
            dartObservatoryURL = await getObservatoryWsUri(driver, caps);
        }
        catch (e) {
            // go to the next retry with do nothing here
            logger_1.log.debug(e);
        }
        const connectedPromise = new Promise((resolve) => {
            logger_1.log.info(`Connecting to Dart Observatory: ${dartObservatoryURL}`);
            const socket = new isolate_socket_1.IsolateSocket(dartObservatoryURL);
            const removeListenerAndResolve = (r) => {
                socket.removeListener(`error`, onErrorListener);
                socket.removeListener(`timeout`, onTimeoutListener);
                socket.removeListener(`open`, onOpenListener);
                resolve(r);
            };
            // Add an 'error' event handler for the client socket
            const onErrorListener = (ex) => {
                logger_1.log.error(JSON.stringify(ex));
                logger_1.log.error(`Check Dart Observatory URI ${lodash_1.default.isString(dartObservatoryURL) ? dartObservatoryURL : 'no URI found in the device log'}`);
                removeListenerAndResolve(null);
            };
            socket.on(`error`, onErrorListener);
            // Add a 'close' event handler for the client socket
            socket.on(`close`, () => {
                logger_1.log.info(`Connection to ${dartObservatoryURL} closed`);
                // @todo do we need to set this.socket = null?
            });
            // Add a 'timeout' event handler for the client socket
            const onTimeoutListener = () => {
                logger_1.log.error(`Connection to ${dartObservatoryURL} timed out`);
                removeListenerAndResolve(null);
            };
            socket.on(`timeout`, onTimeoutListener);
            const onOpenListener = async () => {
                // tslint:disable-next-line:ban-types
                const originalSocketCall = socket.call;
                socket.call = async (...args) => {
                    try {
                        // `await` is needed so that rejected promise will be thrown and caught
                        return await originalSocketCall.apply(socket, args);
                    }
                    catch (e) {
                        logger_1.log.errorAndThrow(JSON.stringify(e));
                    }
                };
                logger_1.log.info(`Connecting to ${dartObservatoryURL}`);
                const vm = await socket.call(`getVM`);
                logger_1.log.info(`Listing all isolates: ${JSON.stringify(vm.isolates)}`);
                // To accept 'main.dart:main()' and 'main'
                const mainIsolateData = vm.isolates.find((e) => e.name.includes(`main`));
                if (!mainIsolateData) {
                    logger_1.log.error(`Cannot get Dart main isolate info`);
                    removeListenerAndResolve(null);
                    socket.close();
                    return;
                }
                // e.g. 'isolates/2978358234363215', '2978358234363215'
                socket.isolateId = mainIsolateData.id;
                // @todo check extension and do health check
                const isolate = await socket.call(`getIsolate`, {
                    isolateId: `${socket.isolateId}`,
                });
                if (!isolate) {
                    logger_1.log.error(`Cannot get main Dart Isolate`);
                    removeListenerAndResolve(null);
                    return;
                }
                if (!Array.isArray(isolate.extensionRPCs)) {
                    logger_1.log.errorAndThrow(`Cannot get Dart extensionRPCs from isolate ${JSON.stringify(isolate)}`);
                    removeListenerAndResolve(null);
                    return;
                }
                if (isolate.extensionRPCs.indexOf(`ext.flutter.driver`) < 0) {
                    const msg = `"ext.flutter.driver" is not found in "extensionRPCs" ${JSON.stringify(isolate.extensionRPCs)}`;
                    logger_1.log.error(msg);
                    removeListenerAndResolve(null);
                    return;
                }
                removeListenerAndResolve(socket);
            };
            socket.on(`open`, onOpenListener);
        });
        retryCount++;
        connectedSocket = await connectedPromise;
        if (!connectedSocket && retryCount === maxRetryCount - 1) {
            logger_1.log.errorAndThrow(`Failed to connect ` + maxRetryCount + ` times. Aborting.`);
        }
    }
    retryCount = 0;
    return connectedSocket;
};
exports.connectSocket = connectSocket;
const executeGetIsolateCommand = async function (isolateId) {
    logger_1.log.debug(`>>> getIsolate`);
    const isolate = await this.socket.call(`getIsolate`, { isolateId: `${isolateId}` });
    logger_1.log.debug(`<<< ${lodash_1.default.truncate(JSON.stringify(isolate), {
        'length': truncateLength, 'omission': `...`
    })}`);
    return isolate;
};
exports.executeGetIsolateCommand = executeGetIsolateCommand;
const executeGetVMCommand = async function () {
    logger_1.log.debug(`>>> getVM`);
    const vm = await this.socket.call(`getVM`);
    logger_1.log.debug(`<<< ${lodash_1.default.truncate(JSON.stringify(vm), {
        'length': truncateLength, 'omission': `...`
    })}`);
    return vm;
};
exports.executeGetVMCommand = executeGetVMCommand;
const executeElementCommand = async function (command, elementBase64, extraArgs = {}) {
    const elementObject = elementBase64 ? JSON.parse((0, base64url_1.decode)(elementBase64)) : {};
    const serializedCommand = { command, ...elementObject, ...extraArgs };
    logger_1.log.debug(`>>> ${JSON.stringify(serializedCommand)}`);
    const data = await this.socket.executeSocketCommand(serializedCommand);
    logger_1.log.debug(`<<< ${JSON.stringify(data)} | previous command ${command}`);
    if (data.isError) {
        throw new Error(`Cannot execute command ${command}, server reponse ${JSON.stringify(data, null, 2)}`);
    }
    return data.response;
};
exports.executeElementCommand = executeElementCommand;
const processLogToGetobservatory = (deviceLogs) => {
    // https://github.com/flutter/flutter/blob/f90b019c68edf4541a4c8273865a2b40c2c01eb3/dev/devicelab/lib/framework/runner.dart#L183
    //  e.g. 'Observatory listening on http://127.0.0.1:52817/_w_SwaKs9-g=/'
    // https://github.com/flutter/flutter/blob/52ae102f182afaa0524d0d01d21b2d86d15a11dc/packages/flutter_tools/lib/src/resident_runner.dart#L1386-L1389
    //  e.g. 'An Observatory debugger and profiler on ${device.device.name} is available at: http://127.0.0.1:52817/_w_SwaKs9-g=/'
    const observatoryUriRegEx = new RegExp(`(Observatory listening on |An Observatory debugger and profiler on\\s.+\\sis available at: |The Dart VM service is listening on )((http|\/\/)[a-zA-Z0-9:/=_\\-\.\\[\\]]+)`);
    // @ts-ignore
    const candidate = deviceLogs
        .map((e) => e.message)
        .reverse()
        .find((e) => e.match(observatoryUriRegEx));
    if (!candidate) {
        throw new Error(`No observatory url was found in the device log. ` +
            `Please make sure the application under test logs an observatory url when the application starts.`);
    }
    const observatoryMatch = candidate.match(observatoryUriRegEx);
    if (!observatoryMatch) {
        throw new Error(`can't find Observatory`);
    }
    const dartObservatoryURI = observatoryMatch[2];
    const dartObservatoryURL = new url_1.URL(dartObservatoryURI);
    dartObservatoryURL.protocol = `ws`;
    dartObservatoryURL.pathname += `ws`;
    return dartObservatoryURL;
};
exports.processLogToGetobservatory = processLogToGetobservatory;
//# sourceMappingURL=observatory.js.map