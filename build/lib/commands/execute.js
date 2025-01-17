"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const scroll_1 = require("./execute/scroll");
const wait_1 = require("./execute/wait");
const flutterCommandRegex = /^[\s]*flutter[\s]*:(.+)/;
const execute = async function (rawCommand, args) {
    // flutter
    const matching = rawCommand.match(flutterCommandRegex);
    if (!matching) {
        throw new Error(`Command not support: "${rawCommand}"`);
    }
    const command = matching[1].trim();
    switch (command) {
        case `getVMInfo`:
            return getVMInfo(this);
        case `setIsolateId`:
            return setIsolateId(this, args[0]);
        case `getIsolate`:
            return getIsolate(this, args[0]);
        case `checkHealth`:
            return checkHealth(this);
        case `clearTimeline`:
            return clearTimeline(this);
        case `forceGC`:
            return forceGC(this);
        case `getRenderTree`:
            return getRenderTree(this);
        case `getBottomLeft`:
            return getOffset(this, args[0], { offsetType: `bottomLeft` });
        case `getBottomRight`:
            return getOffset(this, args[0], { offsetType: `bottomRight` });
        case `getCenter`:
            return getOffset(this, args[0], { offsetType: `center` });
        case `getTopLeft`:
            return getOffset(this, args[0], { offsetType: `topLeft` });
        case `getTopRight`:
            return getOffset(this, args[0], { offsetType: `topRight` });
        case `getRenderObjectDiagnostics`:
            return getRenderObjectDiagnostics(this, args[0], args[1]);
        case `getSemanticsId`:
            return getSemanticsId(this, args[0]);
        case `waitForAbsent`:
            return (0, wait_1.waitForAbsent)(this, args[0], args[1]);
        case `waitFor`:
            return (0, wait_1.waitFor)(this, args[0], args[1]);
        case `waitForTappable`:
            return (0, wait_1.waitForTappable)(this, args[0], args[1]);
        case `scroll`:
            return (0, scroll_1.scroll)(this, args[0], args[1]);
        case `scrollUntilVisible`:
            return (0, scroll_1.scrollUntilVisible)(this, args[0], args[1]);
        case `scrollUntilTapable`:
            return (0, scroll_1.scrollUntilTapable)(this, args[0], args[1]);
        case `scrollIntoView`:
            return (0, scroll_1.scrollIntoView)(this, args[0], args[1]);
        case `setTextEntryEmulation`:
            return setTextEntryEmulation(this, args[0]);
        case `enterText`:
            return enterText(this, args[0]);
        case `sendTextInputAction`:
            return sendTextInputAction(this, args[0]);
        case `requestData`:
            return requestData(this, args[0]);
        case `longTap`:
            return (0, scroll_1.longTap)(this, args[0], args[1]);
        case `waitForFirstFrame`:
            return waitForCondition(this, {
                conditionName: `FirstFrameRasterizedCondition`,
            });
        case `setFrameSync`:
            return setFrameSync(this, args[0], args[1]);
        default:
            throw new Error(`Command not support: "${rawCommand}"`);
    }
};
exports.execute = execute;
const checkHealth = async (self) => (await self.executeElementCommand(`get_health`)).status;
const getVMInfo = async (self) => await self.executeGetVMCommand();
const getRenderTree = async (self) => (await self.executeElementCommand(`get_render_tree`)).tree;
const getOffset = async (self, elementBase64, offsetType) => await self.executeElementCommand(`get_offset`, elementBase64, offsetType);
const waitForCondition = async (self, conditionName) => await self.executeElementCommand(`waitForCondition`, ``, conditionName);
const forceGC = async (self) => {
    const response = (await self.socket.call(`_collectAllGarbage`, {
        isolateId: self.socket.isolateId,
    }));
    if (response.type !== `Success`) {
        throw new Error(`Could not forceGC, response was ${response}`);
    }
};
const setIsolateId = async (self, isolateId) => {
    self.socket.isolateId = isolateId;
    return await self.socket.call(`getIsolate`, {
        isolateId: `${isolateId}`,
    });
};
const getIsolate = async (self, isolateId) => {
    return await self.executeGetIsolateCommand(isolateId || self.socket.isolateId);
};
const anyPromise = (promises) => {
    const newArray = promises.map((p) => p.then((resolvedValue) => Promise.reject(resolvedValue), (rejectedReason) => rejectedReason));
    return Promise.all(newArray).then((rejectedReasons) => Promise.reject(rejectedReasons), (resolvedValue) => resolvedValue);
};
const clearTimeline = async (self) => {
    // @todo backward compatible, need to cleanup later
    const call1 = self.socket.call(`_clearVMTimeline`);
    const call2 = self.socket.call(`clearVMTimeline`);
    const response = await anyPromise([call1, call2]);
    if (response.type !== `Success`) {
        throw new Error(`Could not forceGC, response was ${response}`);
    }
};
const getRenderObjectDiagnostics = async (self, elementBase64, opts) => {
    const { subtreeDepth = 0, includeProperties = true } = opts;
    return await self.executeElementCommand(`get_diagnostics_tree`, elementBase64, {
        diagnosticsType: `renderObject`,
        includeProperties,
        subtreeDepth,
    });
};
const getSemanticsId = async (self, elementBase64) => (await self.executeElementCommand(`get_semantics_id`, elementBase64)).id;
const enterText = async (self, text) => await self.socket.executeSocketCommand({ command: `enter_text`, text });
const requestData = async (self, message) => await self.socket.executeSocketCommand({ command: `request_data`, message });
const setFrameSync = async (self, bool, durationMilliseconds) => await self.socket.executeSocketCommand({
    command: `set_frame_sync`,
    enabled: bool,
    timeout: durationMilliseconds,
});
const setTextEntryEmulation = async (self, enabled) => await self.socket.executeSocketCommand({
    command: `set_text_entry_emulation`,
    enabled,
});
const sendTextInputAction = async (self, action) => {
    return self.socket.executeSocketCommand({
        command: `send_text_input_action`,
        textInputAction: action,
    });
};
//# sourceMappingURL=execute.js.map