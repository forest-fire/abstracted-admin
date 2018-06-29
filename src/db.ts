import * as firebase from "firebase-admin";
import { rtdb } from "firebase-api-surface";
import * as process from "process";
import { Reference } from "firemock";
import {
  RealTimeDB,
  _getFirebaseType,
  IFirebaseAdminConfigProps,
  IFirebaseAdminConfig
} from "abstracted-firebase";
import { EventManager } from "./EventManager";

export type Snapshot = rtdb.IDataSnapshot;
export type Query = rtdb.IQuery;
export type Reference = rtdb.IReference;

export interface IFirebaseListener {
  id: string;
  cb: (db: DB) => void;
}

export class DB extends RealTimeDB {
  /**
   * Instantiates a DB and then waits for the connection
   * to finish before resolving the promise.
   */
  public static async connect(config?: Partial<IFirebaseAdminConfig>) {
    const obj = new DB(config);
    await obj.waitForConnection();
    return obj;
  }

  protected _eventManager: EventManager;
  protected _isAuthorized: boolean;
  protected _storage: firebase.storage.Storage;
  protected _database: rtdb.IFirebaseDatabase;
  protected _firestore: firebase.firestore.Firestore;
  protected _messaging: firebase.messaging.Messaging;
  protected _auth: firebase.auth.Auth;
  protected app: any;

  constructor(config?: Partial<IFirebaseAdminConfig>) {
    super();
    this._eventManager = new EventManager();
    const defaults: Partial<IFirebaseAdminConfig> = {
      name: "[DEFAULT]"
    };
    if (process.env["FIREBASE_SERVICE_ACCOUNT"]) {
      defaults.serviceAccount = process.env["FIREBASE_SERVICE_ACCOUNT"];
    }
    if (process.env["FIREBASE_DATA_ROOT_URL"]) {
      defaults.databaseUrl = process.env["FIREBASE_DATA_ROOT_URL"];
    }

    config = {
      ...defaults,
      ...(config || {})
    };

    if (!config.mocking && (!config.serviceAccount || !config.databaseUrl)) {
      const e = new Error(
        `You must have both the serviceAccount and databaseUrl set if you are starting a non-mocking database. You can include these as ENV variables or pass them with the constructor`
      );
      e.name = "AbstractedAdmin::InsufficientDetails";
      throw e;
    }

    this.initialize(config);
  }

  public get auth() {
    return _getFirebaseType(this, "auth") as firebase.auth.Auth;
  }

  public get firestore() {
    return _getFirebaseType(this, "firestore") as firebase.firestore.Firestore;
  }

  public get database() {
    return _getFirebaseType(this, "database") as rtdb.IFirebaseDatabase;
  }

  public get messaging() {
    return _getFirebaseType(this, "messaging") as firebase.messaging.Messaging;
  }

  public get storage() {
    return _getFirebaseType(this, "storage") as firebase.storage.Storage;
  }

  protected async connectToFirebase(config: IFirebaseAdminConfigProps) {
    if (!this._isAuthorized) {
      const serviceAcctEncoded =
        config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"];
      if (!serviceAcctEncoded) {
        throw new Error(
          "Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key."
        );
      }

      const serviceAccount: firebase.ServiceAccount = JSON.parse(
        Buffer.from(process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString()
      );
      console.log(`Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`);

      try {
        const { name } = config;
        const runningApps = new Set(firebase.apps.map(i => i.name));
        this.app = runningApps.has(name)
          ? firebase.app()
          : firebase.initializeApp({
              credential: firebase.credential.cert(serviceAccount),
              databaseURL: config.databaseUrl
            });
        this._isAuthorized = true;
        this._database = firebase.database() as rtdb.IFirebaseDatabase;
        this.enableDatabaseLogging = firebase.database.enableLogging.bind(
          firebase.database
        );
        this.app = firebase;
        firebase.database().goOnline();
        new EventManager().connection(true);

        firebase
          .database()
          .ref(".info/connected")
          .on("value", snap => {
            this._isConnected = snap.val();
            // cycle through temporary clients
            this._waitingForConnection.forEach(cb => cb());
            this._waitingForConnection = [];
            // call active listeners
            if (this.isConnected) {
              this._onConnected.forEach(listener => listener.cb(this));
            } else {
              this._onDisconnected.forEach(listener => listener.cb(this));
            }
          });
      } catch (err) {
        if (err.message.indexOf("The default Firebase app already exists.") !== -1) {
          console.warn("DB was already logged in, however flag had not been set!");
          this._isConnected = true;
        } else {
          this._isConnected = false;
          console.warn("Problem connecting to Firebase", err);
          throw new Error(err);
        }
      }
    }

    if (config.debugging) {
      this.enableDatabaseLogging(
        typeof config.debugging === "function"
          ? (message: string) => (config.debugging as any)(message)
          : (message: string) => console.log("[FIREBASE]", message)
      );
    }
  }

  /**
   * listenForConnectionStatus
   *
   * in the admin interface we assume that ONCE connected
   * we remain connected; this is unlike the client API
   * which provides an endpoint to lookup
   */
  protected async listenForConnectionStatus() {
    return new Promise(resolve => {
      const cb = () => {
        resolve();
      };
      this._waitingForConnection.push(cb);
    });
  }
}
