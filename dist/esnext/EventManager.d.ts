/// <reference types="node" />
import { EventEmitter } from "events";
export declare class EventManager extends EventEmitter {
    send(state: boolean): void;
}
