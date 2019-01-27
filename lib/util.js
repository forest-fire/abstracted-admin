"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
exports.slashNotation = slashNotation;
function debug(msg, stack) {
    if (process.env.DEBUG) {
        console.log(msg);
        if (stack) {
            console.log(JSON.stringify(stack));
        }
    }
}
exports.debug = debug;
