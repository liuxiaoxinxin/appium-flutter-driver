"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const decode = (input) => {
    let base64String = ``;
    if (typeof input === `string`) {
        base64String = input;
    }
    else if (typeof input === `object` && input.ELEMENT) {
        base64String = input.ELEMENT;
    }
    else {
        throw new Error(`input is invalid ${JSON.stringify(input)}`);
    }
    return Buffer.from(base64String, `base64`).toString();
};
exports.decode = decode;
//# sourceMappingURL=base64url.js.map