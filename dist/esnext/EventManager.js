import { EventEmitter } from "events";
export class EventManager extends EventEmitter {
    connection(state) {
        this.emit("connection", state);
    }
}
