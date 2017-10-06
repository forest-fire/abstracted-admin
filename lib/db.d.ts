import * as firebase from 'firebase-admin';
import { IDictionary } from 'common-types';
import { SerializedQuery } from 'serialized-query';
import { Mock } from 'firemock';
import './google-cloud';
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
export default class DB {
    private static isConnected;
    private static isAuthorized;
    private static connection;
    auth: firebase.auth.Auth;
    private mocking;
    private _mock;
    private _waitingForConnection;
    private _onConnected;
    private _onDisconnected;
    private _debugging;
    private _mocking;
    private _allowMocking;
    constructor(config?: IFirebaseConfig);
    ref(path: string): firebase.database.Reference;
    allowMocking(): void;
    readonly mock: Mock;
    waitForConnection(): Promise<void | {}>;
    readonly isConnected: boolean;
    set<T = any>(path: string, value: T): Promise<void>;
    update<T = IDictionary>(path: string, value: Partial<T>): Promise<void>;
    remove(path: string, ignoreMissing?: boolean): Promise<void>;
    getSnapshot(path: string | SerializedQuery): Promise<firebase.database.DataSnapshot>;
    getValue<T = any>(path: string): Promise<T>;
    getRecord<T = any>(path: string | SerializedQuery, idProp?: string): Promise<T>;
    getList<T = any[]>(path: string | SerializedQuery, idProp?: string): Promise<T[]>;
    getSortedList<T = any[]>(query: any, idProp?: string): Promise<T[]>;
    push<T = any>(path: string, value: T): Promise<any>;
    exists(path: string): Promise<boolean>;
    private handleError(e, name, message?);
    private connect(debugging?);
}
