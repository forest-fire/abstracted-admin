"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase-admin");
const process = require("process");
const abstracted_firebase_1 = require("abstracted-firebase");
const EventManager_1 = require("./EventManager");
const util_1 = require("./util");
const zlib_1 = require("zlib");
const util_2 = require("util");
const gunzipAsync = util_2.promisify(zlib_1.gunzip);
class DB extends abstracted_firebase_1.RealTimeDB {
    static async connect(config) {
        const obj = new DB(config);
        await obj.waitForConnection();
        return obj;
    }
    constructor(config) {
        super();
        this._eventManager = new EventManager_1.EventManager();
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
        return abstracted_firebase_1._getFirebaseType(this, "auth");
    }
    get firestore() {
        return abstracted_firebase_1._getFirebaseType(this, "firestore");
    }
    get database() {
        return abstracted_firebase_1._getFirebaseType(this, "database");
    }
    get messaging() {
        return abstracted_firebase_1._getFirebaseType(this, "messaging");
    }
    get storage() {
        return abstracted_firebase_1._getFirebaseType(this, "storage");
    }
    goOnline() {
        try {
            this._database.goOnline();
        }
        catch (e) {
            util_1.debug("There was an error going online:" + e);
        }
    }
    goOffline() {
        this._database.goOffline();
    }
    async connectToFirebase(config) {
        if (!this._isAuthorized) {
            const serviceAcctEncoded = process.env.FIREBASE_SERVICE_ACCOUNT_COMPRESSED
                ? (await gunzipAsync(Buffer.from(config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"]))).toString("utf-8")
                : config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"];
            if (!serviceAcctEncoded) {
                throw new Error("Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key or pass it in explicitly as part of the config object.");
            }
            const serviceAccount = JSON.parse(Buffer.from(config.serviceAccount
                ? config.serviceAccount
                : process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString());
            console.log(`Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`);
            try {
                const { name } = config;
                const runningApps = new Set(firebase.apps.map(i => i.name));
                util_1.debug(`AbstractedAdmin: the DB "${name}" ` + runningApps.has(name)
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
                this.goOnline();
                new EventManager_1.EventManager().connection(true);
                this._database.ref(".info/connected").on("value", snap => {
                    this._isConnected = snap.val();
                    this._waitingForConnection.forEach(cb => cb());
                    this._waitingForConnection = [];
                    if (this.isConnected) {
                        util_1.debug(`AbstractedAdmin: connected to ${name}`);
                        this._onConnected.forEach(listener => listener.cb(this));
                    }
                    else {
                        util_1.debug(`AbstractedAdmin: disconnected from ${name}`);
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
    async listenForConnectionStatus() {
        return new Promise(resolve => {
            const cb = () => {
                resolve();
            };
            this._waitingForConnection.push(cb);
        });
    }
}
exports.DB = DB;
