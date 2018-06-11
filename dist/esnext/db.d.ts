import * as firebase from "firebase-admin";
import { rtdb } from "firebase-api-surface";
import { RealTimeDB, IFirebaseAdminConfigProps, IFirebaseAdminConfig } from "abstracted-firebase";
import { EventManager } from "./EventManager";
export declare type Snapshot = rtdb.IDataSnapshot;
export declare type Query = rtdb.IQuery;
export declare type Reference = rtdb.IReference;
export interface IFirebaseListener {
    id: string;
    cb: (db: DB) => void;
}
export declare class DB extends RealTimeDB {
    protected _eventManager: EventManager;
    protected _isAuthorized: boolean;
    protected _storage: firebase.storage.Storage;
    protected _database: rtdb.IFirebaseDatabase;
    protected _firestore: firebase.firestore.Firestore;
    protected _messaging: firebase.messaging.Messaging;
    protected _auth: firebase.auth.Auth;
    protected app: any;
    constructor(config?: Partial<IFirebaseAdminConfig>);
    readonly auth: firebase.auth.Auth;
    readonly firestore: FirebaseFirestore.Firestore;
    readonly database: rtdb.IFirebaseDatabase;
    readonly messaging: firebase.messaging.Messaging;
    readonly storage: firebase.storage.Storage;
    protected connectToFirebase(config: IFirebaseAdminConfigProps): Promise<void>;
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    protected listenForConnectionStatus(): Promise<{}>;
}
