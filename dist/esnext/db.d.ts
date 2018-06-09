import * as firebase from "firebase-admin";
import { rtdb } from "firebase-api-surface";
import { RealTimeDB } from "abstracted-firebase";
export declare type Snapshot = rtdb.IDataSnapshot;
export declare type Query = rtdb.IQuery;
export declare type Reference = rtdb.IReference;
export declare type DebuggingCallback = (message: string) => void;
export interface IFirebaseConfig {
    debugging?: boolean | DebuggingCallback;
    mocking?: boolean;
}
export interface IFirebaseListener {
    id: string;
    cb: (db: DB) => void;
}
export declare class DB extends RealTimeDB {
    auth: firebase.auth.Auth;
    constructor(config?: IFirebaseConfig);
    waitForConnection(): Promise<void | {}>;
    readonly isConnected: boolean;
    private connect;
}
