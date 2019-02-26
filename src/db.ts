import * as firebase from "firebase-admin";
import * as process from "process";
import {
  RealTimeDB,
  _getFirebaseType,
  IFirebaseAdminConfigProps,
  IFirebaseAdminConfig
} from "abstracted-firebase";
import { EventManager } from "./EventManager";
import { debug } from "./util";
import { gunzip } from "zlib";
import { promisify } from "util";
const gunzipAsync = promisify<Buffer, Buffer>(gunzip);

export type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export type FirebaseFirestore = import("@firebase/firestore-types").FirebaseFirestore;
export type FirebaseMessaging = import("@firebase/messaging-types").FirebaseMessaging;
export type FirebaseStorage = import("@firebase/storage-types").FirebaseStorage;
export type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;

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
  protected _storage: FirebaseStorage;
  protected _database: FirebaseDatabase;
  protected _firestore: FirebaseFirestore;
  protected _messaging: FirebaseMessaging;
  protected _auth: FirebaseAuth;
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
        `You must have both the serviceAccount and databaseUrl set if you are starting a non-mocking database. You can include these as ENV variables or pass them with the constructor's configuration hash`
      );
      e.name = "AbstractedAdmin::InsufficientDetails";
      throw e;
    }

    this.initialize(config);
  }

  public get auth() {
    return _getFirebaseType(this, "auth") as firebase.auth.Auth;
  }

  public get firestore(): FirebaseFirestore {
    return _getFirebaseType(this, "firestore");
  }

  public get database(): FirebaseDatabase {
    return _getFirebaseType(this, "database");
  }

  public get messaging(): FirebaseMessaging {
    return _getFirebaseType(this, "messaging");
  }

  public get storage(): FirebaseStorage {
    return _getFirebaseType(this, "storage");
  }

  public goOnline() {
    try {
      this._database.goOnline();
    } catch (e) {
      debug("There was an error going online:" + e);
    }
  }

  public goOffline() {
    this._database.goOffline();
  }

  protected async connectToFirebase(config: IFirebaseAdminConfigProps) {
    if (!this._isAuthorized) {
      const serviceAcctEncoded = process.env.FIREBASE_SERVICE_ACCOUNT_COMPRESSED
        ? (await gunzipAsync(
            Buffer.from(config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"])
          )).toString("utf-8")
        : config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"];

      if (!serviceAcctEncoded) {
        throw new Error(
          "Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key or pass it in explicitly as part of the config object."
        );
      }
      if (!config.serviceAccount && !process.env["FIREBASE_SERVICE_ACCOUNT"]) {
        throw new Error(
          `Service account was not defined in passed in configuration nor the FIREBASE_SERVICE_ACCOUNT environment variable.`
        );
      }

      const serviceAccount: firebase.ServiceAccount = JSON.parse(
        Buffer.from(
          config.serviceAccount
            ? config.serviceAccount
            : process.env["FIREBASE_SERVICE_ACCOUNT"],
          "base64"
        ).toString()
      );
      console.log(`Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`);

      try {
        const { name } = config;
        const runningApps = new Set(firebase.apps.map(i => i.name));
        debug(
          `AbstractedAdmin: the DB "${name}" ` + runningApps.has(name)
            ? "appears to be already connected"
            : "has not yet been connected"
        );

        this.app = runningApps.has(name)
          ? firebase.app()
          : firebase.initializeApp({
              credential: firebase.credential.cert(serviceAccount),
              databaseURL: config.databaseUrl
            });
        this._isAuthorized = true;
        this._database = firebase.database() as any;
        this.enableDatabaseLogging = firebase.database.enableLogging.bind(
          firebase.database
        );
        this.app = firebase;
        this.goOnline();
        new EventManager().connection(true);

        this._database.ref(".info/connected").on("value", snap => {
          this._isConnected = snap.val();
          // cycle through temporary clients
          this._waitingForConnection.forEach(cb => cb());
          this._waitingForConnection = [];
          // call active listeners
          if (this.isConnected) {
            debug(`AbstractedAdmin: connected to ${name}`);
            this._onConnected.forEach(listener => listener.cb(this));
          } else {
            debug(`AbstractedAdmin: disconnected from ${name}`);
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
