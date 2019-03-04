import * as firebase from "firebase-admin";
import { RealTimeDB, IFirebaseAdminConfigProps, IFirebaseAdminConfig } from "abstracted-firebase";
import { EventManager } from "./EventManager";
export declare type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export declare type FirebaseFirestore = import("@firebase/firestore-types").FirebaseFirestore;
export declare type FirebaseMessaging = import("@firebase/messaging-types").FirebaseMessaging;
export declare type FirebaseStorage = import("@firebase/storage-types").FirebaseStorage;
export declare type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export interface IFirebaseListener {
    id: string;
    cb: (db: DB) => void;
}
export declare class DB extends RealTimeDB {
    /**
     * Instantiates a DB and then waits for the connection
     * to finish before resolving the promise.
     */
    static connect(config?: Partial<IFirebaseAdminConfig>): Promise<DB>;
    protected _eventManager: EventManager;
    protected _isAuthorized: boolean;
    protected _storage: FirebaseStorage;
    protected _database: FirebaseDatabase;
    protected _firestore: FirebaseFirestore;
    protected _messaging: FirebaseMessaging;
    protected _auth: FirebaseAuth;
    protected app: any;
    constructor(config?: Partial<IFirebaseAdminConfig>);
    readonly auth: firebase.auth.Auth;
    readonly firestore: FirebaseFirestore;
    readonly database: FirebaseDatabase;
    readonly messaging: FirebaseMessaging;
    readonly storage: FirebaseStorage;
    goOnline(): void;
    goOffline(): void;
    protected connectToFirebase(config: IFirebaseAdminConfigProps): Promise<void>;
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    protected listenForConnectionStatus(): void;
}
