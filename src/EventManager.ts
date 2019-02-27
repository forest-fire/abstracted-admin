import { EventEmitter } from "events";
import { IEmitter } from "abstracted-firebase";

export class EventManager extends EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit("connection", state);
  }
}
