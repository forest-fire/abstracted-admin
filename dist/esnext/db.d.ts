import * as firebase from "firebase-admin";
import { RealTimeDB, IFirebaseAdminConfig, IFirebaseConfig } from "abstracted-firebase";
import { EventManager } from "./EventManager";
export declare type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export declare type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export interface IFirebaseListener {
    id: string;
    cb: (db: DB) => void;
}
export declare class DB extends RealTimeDB<firebase.auth.Auth> {
    protected _isAdminApi: boolean;
    /**
     * Instantiates a DB and then waits for the connection
     * to finish before resolving the promise.
     */
    static connect(config?: IFirebaseAdminConfig): Promise<DB>;
    protected _eventManager: EventManager;
    protected _clientType: "client" | "admin";
    protected _isAuthorized: boolean;
    protected _database: FirebaseDatabase;
    protected _auth: FirebaseAuth;
    protected app: any;
    constructor(config?: IFirebaseAdminConfig);
    /**
     * Provides access to the Firebase Admin Auth API.
     *
     * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
     * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
     * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
     * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
     * as part of the configuration (using either "real" or "mocked" as a value)
     *
     * References:
     * - [Introduction](https://firebase.google.com/docs/auth/admin)
     * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
     */
    auth(): Promise<firebase.auth.Auth>;
    goOnline(): void;
    goOffline(): void;
    protected connectToFirebase(config: IFirebaseConfig): Promise<void>;
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    protected listenForConnectionStatus(): void;
}
