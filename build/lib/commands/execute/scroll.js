"use strict";
// tslint:disable:object-literal-sort-keys
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollIntoView = exports.scrollUntilTapable = exports.scrollUntilVisible = exports.longTap = exports.scroll = void 0;
const lodash_1 = __importDefault(require("lodash"));
const wait_1 = require("./wait");
const scroll = async (self, elementBase64, opts) => {
    const { dx, dy, durationMilliseconds, frequency = 60 } = opts;
    if (typeof dx !== `number` ||
        typeof dy !== `number` ||
        typeof durationMilliseconds !== `number` ||
        typeof frequency !== `number`) {
        // @todo BaseDriver's errors.InvalidArgumentError();
        throw new Error(`${opts} is not a valid options`);
    }
    if (dx === 0 && dy === 0) {
        // @todo BaseDriver's errors.InvalidArgumentError();
        throw new Error(`${opts} is not a valid options`);
    }
    return await self.executeElementCommand(`scroll`, elementBase64, {
        dx,
        dy,
        // 'scroll' expects microseconds
        // https://github.com/flutter/flutter/blob/master/packages/flutter_driver/lib/src/common/gesture.dart#L33-L38
        duration: durationMilliseconds * 1000,
        frequency,
    });
};
exports.scroll = scroll;
const longTap = async (self, elementBase64, opts) => {
    const { durationMilliseconds, frequency = 60 } = opts;
    if (typeof durationMilliseconds !== `number` ||
        typeof frequency !== `number`) {
        // @todo BaseDriver's errors.InvalidArgumentError();
        throw new Error(`${opts} is not a valid options`);
    }
    return await self.executeElementCommand(`scroll`, elementBase64, {
        dx: 0,
        dy: 0,
        // 'scroll' expects microseconds
        // https://github.com/flutter/flutter/blob/master/packages/flutter_driver/lib/src/common/gesture.dart#L33-L38
        duration: durationMilliseconds * 1000,
        frequency,
    });
};
exports.longTap = longTap;
const validateOps = (alignment, dxScroll, dyScroll) => {
    if (typeof alignment !== `number` ||
        typeof dxScroll !== `number` ||
        typeof dyScroll !== `number`) {
        return false;
    }
    if (dxScroll === 0 && dyScroll === 0) {
        return false;
    }
    return true;
};
const shouldRetry = (startAt, waitTimeoutMilliseconds) => {
    if (!waitTimeoutMilliseconds) {
        // Then, the scroll should continue infinitely
        return true;
    }
    if (Date.now() - startAt > lodash_1.default.toInteger(waitTimeoutMilliseconds)) {
        return false;
    }
    return true;
};
const scrollUntilVisible = async (self, elementBase64, opts) => {
    const { item, alignment = 0.0, dxScroll = 0, dyScroll = 0, durationMilliseconds = 100, frequency, waitTimeoutMilliseconds } = opts;
    if (!validateOps(alignment, dxScroll, dyScroll)) {
        throw new Error(`${opts} is not a valid options`);
    }
    // An expectation for checking that an element, known to be present on the widget tree, is visible
    let isVisible = false;
    const startAt = Date.now();
    while (isVisible || shouldRetry(startAt, waitTimeoutMilliseconds)) {
        try {
            (0, wait_1.waitFor)(self, item).then((_value) => {
                isVisible = true;
            });
            if (isVisible) {
                // the element is in the view
                break;
            }
            await (0, exports.scroll)(self, elementBase64, {
                dx: dxScroll,
                dy: dyScroll,
                durationMilliseconds: 100,
                frequency
            });
        }
        catch { /* go to the next scroll */ }
    }
    if (!isVisible) {
        throw new Error(`Stop scrolling as timeout ${waitTimeoutMilliseconds}`);
    }
    return (0, exports.scrollIntoView)(self, item, { alignment });
};
exports.scrollUntilVisible = scrollUntilVisible;
const scrollUntilTapable = async (self, elementBase64, opts) => {
    const { item, alignment = 0.0, dxScroll = 0, dyScroll = 0, durationMilliseconds = 100, frequency, waitTimeoutMilliseconds } = opts;
    if (!validateOps(alignment, dxScroll, dyScroll)) {
        throw new Error(`${opts} is not a valid options`);
    }
    // Kick off an (unawaited) waitForTappable that will complete when the item we're
    // looking for finally scrolls onscreen and can be hit-tested. We add an initial pause to give it
    // the chance to complete if the item is already onscreen; if not, scroll
    // repeatedly until we either find the item or time out.
    let isVisible = false;
    const startAt = Date.now();
    while (isVisible || shouldRetry(startAt, waitTimeoutMilliseconds)) {
        try {
            (0, wait_1.waitForTappable)(self, item).then((_value) => {
                isVisible = true;
            });
            if (isVisible) {
                // the element is in the view
                break;
            }
            await (0, exports.scroll)(self, elementBase64, {
                dx: dxScroll,
                dy: dyScroll,
                durationMilliseconds: 100,
                frequency
            });
        }
        catch { /* go to the next scroll */ }
    }
    if (!isVisible) {
        throw new Error(`Stop scrolling as timeout ${waitTimeoutMilliseconds}`);
    }
    return (0, exports.scrollIntoView)(self, item, { alignment });
};
exports.scrollUntilTapable = scrollUntilTapable;
const scrollIntoView = async (self, elementBase64, opts) => {
    const { alignment = 0.0, timeout } = opts;
    if (typeof alignment !== `number` || (typeof timeout !== `undefined` && typeof timeout !== `number`)) {
        // @todo BaseDriver's errors.InvalidArgumentError();
        throw new Error(`${opts} is not a valid options`);
    }
    const args = typeof timeout === `number` ? { alignment, timeout } : { alignment };
    return await self.executeElementCommand(`scrollIntoView`, elementBase64, args);
};
exports.scrollIntoView = scrollIntoView;
//# sourceMappingURL=scroll.js.map