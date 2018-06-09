(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('firebase-admin'), require('process'), require('abstracted-firebase'), require('serialized-query')) :
    typeof define === 'function' && define.amd ? define(['exports', 'firebase-admin', 'process', 'abstracted-firebase', 'serialized-query'], factory) :
    (factory((global.AbstractedAdmin = {}),global.firebase,global.process,global.abstractedFirebase,global.serializedQuery));
}(this, (function (exports,firebase,process,abstractedFirebase,serializedQuery) { 'use strict';

    class DB extends abstractedFirebase.RealTimeDB {
        constructor(config = {}) {
            super(config);
            if (!config.mocking) {
                this.connect(config.debugging);
                abstractedFirebase.RealTimeDB.connection = firebase.database();
                firebase.database().goOnline();
                firebase.database()
                    .ref(".info/connected")
                    .on("value", snap => {
                    DB.isConnected = snap.val();
                    // cycle through temporary clients
                    this._waitingForConnection.forEach(cb => cb());
                    this._waitingForConnection = [];
                    // call active listeners
                    if (DB.isConnected) {
                        this._onConnected.forEach(listener => listener.cb(this));
                    }
                    else {
                        this._onDisconnected.forEach(listener => listener.cb(this));
                    }
                });
            }
        }
        async waitForConnection() {
            if (DB.isConnected) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                const cb = () => {
                    resolve();
                };
                this._waitingForConnection.push(cb);
            });
        }
        get isConnected() {
            return DB.isConnected;
        }
        connect(debugging = false) {
            if (!DB.isAuthorized) {
                const serviceAcctEncoded = process.env["FIREBASE_SERVICE_ACCOUNT"];
                if (!serviceAcctEncoded) {
                    throw new Error("Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key.");
                }
                const serviceAccount = JSON.parse(Buffer.from(process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString());
                console.log(`Connecting to Firebase: [${process.env["FIREBASE_DATA_ROOT_URL"]}]`);
                try {
                    firebase.initializeApp({
                        credential: firebase.credential.cert(serviceAccount),
                        databaseURL: process.env["FIREBASE_DATA_ROOT_URL"]
                    });
                    DB.isAuthorized = true;
                }
                catch (err) {
                    if (err.message.indexOf("The default Firebase app already exists.") !== -1) {
                        console.warn("DB was already logged in, however flag had not been set!");
                        DB.isConnected = true;
                    }
                    else {
                        DB.isConnected = false;
                        console.warn("Problem connecting to Firebase", err);
                        throw new Error(err);
                    }
                }
            }
            if (debugging) {
                firebase.database.enableLogging(typeof debugging === "function"
                    ? (message) => debugging(message)
                    : (message) => console.log("[FIREBASE]", message));
            }
        }
    }

    exports.RealTimeDB = abstractedFirebase.RealTimeDB;
    exports.FirebaseBoolean = abstractedFirebase.FirebaseBoolean;
    exports.SerializedQuery = serializedQuery.SerializedQuery;
    exports.DB = DB;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=abstracted-admin.umd.js.map
