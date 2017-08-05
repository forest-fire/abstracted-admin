import * as firebase from 'firebase-admin';
import { IDictionary } from 'common-types';
export declare enum FirebaseBoolean {
    true = 1,
    false = 0,
}
export declare type Snapshot = firebase.database.DataSnapshot;
export declare type Reference = firebase.database.Reference;
export default class DB {
    private static isConnected;
    private static isAuthorized;
    private static connection;
    auth: firebase.auth.Auth;
    private mocking;
    private _waitingForConnection;
    constructor(debugging?: boolean);
    ref(path: string): firebase.database.Reference;
    waitForConnection(): Promise<void | {}>;
    readonly isConnected: boolean;
    set<T = any>(path: string, value: T): Promise<void>;
    update<T = IDictionary>(path: string, value: Partial<T>): Promise<void>;
    remove(path: string, ignoreMissing?: boolean): Promise<void>;
    getSnapshot(path: string): Promise<firebase.database.DataSnapshot>;
    getValue<T = any>(path: string): Promise<T>;
    getRecord<T = any>(path: string): Promise<T>;
    push<T = IDictionary<any>>(path: string, value: T): Promise<any>;
    exists(path: string): Promise<boolean>;
    private handleError(e, name, message?);
    private connect(debugging?);
}
