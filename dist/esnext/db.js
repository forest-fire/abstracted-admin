import * as firebase from "firebase-admin";
import * as process from "process";
import { RealTimeDB, _getFirebaseType } from "abstracted-firebase";
import { EventManager } from "./EventManager";
import { debug } from "util";
export class DB extends RealTimeDB {
    /**
     * Instantiates a DB and then waits for the connection
     * to finish before resolving the promise.
     */
    static async connect(config) {
        const obj = new DB(config);
        await obj.waitForConnection();
        return obj;
    }
    constructor(config) {
        super();
        this._eventManager = new EventManager();
        const defaults = {
            name: "[DEFAULT]"
        };
        if (process.env["FIREBASE_SERVICE_ACCOUNT"]) {
            defaults.serviceAccount = process.env["FIREBASE_SERVICE_ACCOUNT"];
        }
        if (process.env["FIREBASE_DATA_ROOT_URL"]) {
            defaults.databaseUrl = process.env["FIREBASE_DATA_ROOT_URL"];
        }
        config = Object.assign({}, defaults, (config || {}));
        if (!config.mocking && (!config.serviceAccount || !config.databaseUrl)) {
            const e = new Error(`You must have both the serviceAccount and databaseUrl set if you are starting a non-mocking database. You can include these as ENV variables or pass them with the constructor's configuration hash`);
            e.name = "AbstractedAdmin::InsufficientDetails";
            throw e;
        }
        this.initialize(config);
    }
    get auth() {
        return _getFirebaseType(this, "auth");
    }
    get firestore() {
        return _getFirebaseType(this, "firestore");
    }
    get database() {
        return _getFirebaseType(this, "database");
    }
    get messaging() {
        return _getFirebaseType(this, "messaging");
    }
    get storage() {
        return _getFirebaseType(this, "storage");
    }
    async connectToFirebase(config) {
        if (!this._isAuthorized) {
            const serviceAcctEncoded = config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"];
            if (!serviceAcctEncoded) {
                throw new Error("Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key.");
            }
            const serviceAccount = JSON.parse(Buffer.from(process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString());
            console.log(`Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`);
            try {
                const { name } = config;
                const runningApps = new Set(firebase.apps.map(i => i.name));
                debug(`AbstractedAdmin: the DB "${name}" ` + runningApps.has(name)
                    ? "appears to be already connected"
                    : "has not yet been connected");
                this.app = runningApps.has(name)
                    ? firebase.app()
                    : firebase.initializeApp({
                        credential: firebase.credential.cert(serviceAccount),
                        databaseURL: config.databaseUrl
                    });
                this._isAuthorized = true;
                this._database = firebase.database();
                this.enableDatabaseLogging = firebase.database.enableLogging.bind(firebase.database);
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
                        debug(`AbstractedAdmin: connected to ${name}`);
                        this._onConnected.forEach(listener => listener.cb(this));
                    }
                    else {
                        debug(`AbstractedAdmin: disconnected from ${name}`);
                        this._onDisconnected.forEach(listener => listener.cb(this));
                    }
                });
            }
            catch (err) {
                if (err.message.indexOf("The default Firebase app already exists.") !== -1) {
                    console.warn("DB was already logged in, however flag had not been set!");
                    this._isConnected = true;
                }
                else {
                    this._isConnected = false;
                    console.warn("Problem connecting to Firebase", err);
                    throw new Error(err);
                }
            }
        }
        if (config.debugging) {
            this.enableDatabaseLogging(typeof config.debugging === "function"
                ? (message) => config.debugging(message)
                : (message) => console.log("[FIREBASE]", message));
        }
    }
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    async listenForConnectionStatus() {
        return new Promise(resolve => {
            const cb = () => {
                resolve();
            };
            this._waitingForConnection.push(cb);
        });
    }
}
