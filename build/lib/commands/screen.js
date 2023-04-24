"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreenshot = void 0;
const getScreenshot = async function () {
    if (this.currentContext === 'NATIVE_APP') {
        return this.proxydriver.getScreenshot();
    }
    const response = await this.socket.call(`_flutter.screenshot`);
    return response.screenshot;
};
exports.getScreenshot = getScreenshot;
//# sourceMappingURL=screen.js.map