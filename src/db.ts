import * as firebase from "firebase-admin";
import * as process from "process";
import {
  RealTimeDB,
  _getFirebaseType,
  IFirebaseAdminConfigProps,
  IFirebaseAdminConfig,
  isMockConfig,
  IFirebaseConfig,
  IFirebaseConfigMocked
} from "abstracted-firebase";
import { EventManager } from "./EventManager";
import { debug } from "./util";
import { gunzip } from "zlib";
import { promisify } from "util";
import { AbstractedAdminError } from "./errors/AbstractedAdminError";
const gunzipAsync = promisify<Buffer, Buffer>(gunzip);

export type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
// tslint:disable-next-line: no-implicit-dependencies
export type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;

export interface IFirebaseListener {
  id: string;
  cb: (db: DB) => void;
}

export class DB extends RealTimeDB<firebase.auth.Auth> {
  protected _isAdminApi = true;
  /**
   * Instantiates a DB and then waits for the connection
   * to finish before resolving the promise.
   */
  public static async connect(config?: IFirebaseAdminConfig) {
    const obj = new DB(config);
    await obj.waitForConnection();
    return obj;
  }

  protected _eventManager: EventManager;
  protected _clientType: "client" | "admin" = "admin";
  protected _isAuthorized: boolean;
  protected _database: FirebaseDatabase;
  protected _auth: FirebaseAuth;
  protected app: any;

  constructor(config?: IFirebaseAdminConfig) {
    super(config);
    this._eventManager = new EventManager();
    const defaults: IFirebaseAdminConfig = {
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

    if (
      !isMockConfig(config) &&
      (!config.serviceAccount || !config.databaseUrl)
    ) {
      throw new AbstractedAdminError(
        `You must have both the "serviceAccount" and "databaseUrl" set if you are starting a non-mocking database. You can include these as ENV variables (FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATA_ROOT_URL) or pass them with the constructor's configuration hash`,
        "abstracted-admin/bad-configuration"
      );
    }

    this.initialize(config);
  }

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
  public async auth(): Promise<firebase.auth.Auth> {
    return _getFirebaseType(this, "auth") as firebase.auth.Auth;
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

  protected async connectToFirebase(config: IFirebaseConfig) {
    if (isMockConfig(config)) {
      // MOCK DB
      config = config as IFirebaseConfigMocked;
      await this.getFireMock({
        db: config.mockData || {},
        auth: { providers: [], ...config.mockAuth }
      });
      this._isConnected = true;
    } else {
      if (this._isConnected && this.app) {
        // note: next two lines may not be necessary but better safe than sorry
        this.goOnline();
        new EventManager().connection(true);
        return;
      }

      config = config as IFirebaseAdminConfigProps;
      if (!this._isAuthorized) {
        const serviceAcctEncoded = process.env
          .FIREBASE_SERVICE_ACCOUNT_COMPRESSED
          ? (
              await gunzipAsync(
                Buffer.from(
                  config.serviceAccount ||
                    process.env["FIREBASE_SERVICE_ACCOUNT"]
                )
              )
            ).toString("utf-8")
          : config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"];

        if (!serviceAcctEncoded) {
          throw new Error(
            "Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key or pass it in explicitly as part of the config object."
          );
        }
        if (
          !config.serviceAccount &&
          !process.env["FIREBASE_SERVICE_ACCOUNT"]
        ) {
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
        console.log(
          `Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`
        );

        try {
          const { name } = config;
          const runningApps = new Set(firebase.apps.map(i => i.name));
          debug(
            `abstracted-admin: the DB "${name}" ` + runningApps.has(name)
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
        } catch (err) {
          if (
            err.message.indexOf("The default Firebase app already exists.") !==
            -1
          ) {
            console.warn(
              "DB was already logged in, however flag had not been set!"
            );
            this._isConnected = true;
          } else {
            this._isConnected = false;
            console.warn("Problem connecting to Firebase", err);
            throw new Error(err);
          }
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
  protected listenForConnectionStatus() {
    this._isConnected = true;
    this._eventManager.connection(true);
  }
}
