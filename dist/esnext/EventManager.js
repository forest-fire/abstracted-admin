import { EventEmitter } from "events";
export class EventManager extends EventEmitter {
    send(state) {
        this.emit("connection", state);
    }
}
