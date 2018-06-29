"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class EventManager extends events_1.EventEmitter {
    connection(state) {
        this.emit("connection", state);
    }
}
exports.EventManager = EventManager;
