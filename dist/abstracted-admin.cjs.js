'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var firebase = require('firebase-admin');
var process = require('process');
var abstractedFirebase = require('abstracted-firebase');
var serializedQuery = require('serialized-query');

class DB extends abstractedFirebase.RealTimeDB {
    constructor(config) {
        super();
        config = Object.assign({
            name: "[default]"
        }, config);
        this.initialize(config);
    }
    get auth() {
        return abstractedFirebase._getFirebaseType(this, "auth");
    }
    get firestore() {
        return abstractedFirebase._getFirebaseType(this, "firestore");
    }
    get database() {
        return abstractedFirebase._getFirebaseType(this, "database");
    }
    get messaging() {
        return abstractedFirebase._getFirebaseType(this, "messaging");
    }
    get storage() {
        return abstractedFirebase._getFirebaseType(this, "storage");
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
                firebase.initializeApp({
                    credential: firebase.credential.cert(serviceAccount),
                    databaseURL: config.databaseUrl || process.env["FIREBASE_DATA_ROOT_URL"]
                });
                this._isAuthorized = true;
                this._database = firebase.database();
                firebase.database().goOnline();
                firebase.database()
                    .ref(".info/connected")
                    .on("value", snap => {
                    this._isConnected = snap.val();
                    // cycle through temporary clients
                    this._waitingForConnection.forEach(cb => cb());
                    this._waitingForConnection = [];
                    // call active listeners
                    if (this.isConnected) {
                        this._onConnected.forEach(listener => listener.cb(this));
                    }
                    else {
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
        // if (config.debugging) {
        //   firebase.database.enableLogging(
        //     typeof config.debugging === "function"
        //       ? (message: string) => config.debugging(message)
        //       : (message: string) => console.log("[FIREBASE]", message)
        //   );
        // }
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

exports.RealTimeDB = abstractedFirebase.RealTimeDB;
exports.FirebaseBoolean = abstractedFirebase.FirebaseBoolean;
exports.SerializedQuery = serializedQuery.SerializedQuery;
exports.DB = DB;
//# sourceMappingURL=abstracted-admin.cjs.js.map
