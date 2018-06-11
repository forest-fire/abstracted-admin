import { EventEmitter } from "events";

export class EventManager extends EventEmitter {
  public connection(state: boolean) {
    this.emit("connection", state);
  }
}
