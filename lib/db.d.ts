import * as firebase from "firebase-admin";
import { RealTimeDB } from "abstracted-firebase";
export declare enum FirebaseBoolean {
    true = 1,
    false = 0,
}
export declare type Snapshot = firebase.database.DataSnapshot;
export declare type Query = firebase.database.Query;
export declare type Reference = firebase.database.Reference;
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
    private connect(debugging?);
}
