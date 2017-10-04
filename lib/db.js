"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase-admin");
const convert = require("typed-conversions");
const process = require("process");
const util_1 = require("./util");
const firemock_1 = require("firemock");
require("./google-cloud");
var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean = exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));
class DB {
    constructor(config = {}) {
        this.mocking = false;
        this._waitingForConnection = [];
        this._onConnected = [];
        this._onDisconnected = [];
        this._debugging = false;
        this._mocking = false;
        this._allowMocking = false;
        if (config.mocking) {
            this._mocking = true;
        }
        else {
            this.connect(config.debugging);
            DB.connection = firebase.database();
            firebase.database().goOnline();
            firebase.database().ref('.info/connected').on('value', (snap) => {
                DB.isConnected = snap.val();
                this._waitingForConnection.forEach(cb => cb());
                this._waitingForConnection = [];
                if (DB.isConnected) {
                    this._onConnected.forEach(listener => listener.cb(this));
                }
                else {
                    this._onDisconnected.forEach(listener => listener.cb(this));
                }
            });
        }
    }
    ref(path) {
        return this._mocking
            ? this.mock.ref(path)
            : DB.connection.ref(path);
    }
    allowMocking() {
        this._allowMocking = true;
    }
    get mock() {
        if (!this._mocking && !this._allowMocking) {
            throw new Error('You can not mock the database without setting mocking in the constructor');
        }
        if (!this._mock) {
            this._mock = new firemock_1.Mock();
            firemock_1.resetDatabase();
        }
        return this._mock;
    }
    waitForConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (DB.isConnected) {
                return Promise.resolve();
            }
            return new Promise((resolve) => {
                const cb = () => {
                    resolve();
                };
                this._waitingForConnection.push(cb);
            });
        });
    }
    get isConnected() {
        return DB.isConnected;
    }
    set(path, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.ref(path).set(value)
                .catch(e => this.handleError(e, 'set', `setting value @ "${path}"`));
        });
    }
    update(path, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.ref(path).update(value);
        });
    }
    remove(path, ignoreMissing = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = this.ref(path);
            return ref.remove()
                .catch((e) => {
                if (ignoreMissing && e.message.indexOf('key is not defined') !== -1) {
                    return Promise.resolve();
                }
                this.handleError(e, 'remove', `attempt to remove ${path} failed: `);
            });
        });
    }
    getSnapshot(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeof path === 'string'
                ? this.ref(util_1.slashNotation(path)).once('value')
                : path.execute(this);
        });
    }
    getValue(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const snap = yield this.getSnapshot(path);
            return snap.val();
        });
    }
    getRecord(path, idProp = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSnapshot(path)
                .then(snap => {
                let object = snap.val();
                if (typeof object !== 'object') {
                    object = { value: snap.val() };
                }
                return Object.assign({}, object, { [idProp]: snap.key });
            });
        });
    }
    getList(path, idProp = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSnapshot(path)
                .then(snap => {
                return convert.snapshotToArray(snap, idProp);
            });
        });
    }
    getSortedList(query, idProp = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSnapshot(query)
                .then(snap => {
                return convert.snapshotToArray(snap, idProp);
            });
        });
    }
    push(path, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.ref(path).push(value);
        });
    }
    exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSnapshot(path)
                .then(snap => snap.val() ? true : false);
        });
    }
    handleError(e, name, message = '') {
        console.error(`Error ${message}:`, e);
        return Promise.reject({
            code: `firebase/${name}`,
            message: message + e.message || e
        });
    }
    connect(debugging = false) {
        if (!DB.isAuthorized) {
            const serviceAcctEncoded = process.env['FIREBASE_SERVICE_ACCOUNT'];
            if (!serviceAcctEncoded) {
                throw new Error('Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key.');
            }
            const serviceAccount = JSON.parse(Buffer
                .from(process.env['FIREBASE_SERVICE_ACCOUNT'], 'base64')
                .toString());
            console.log(`Connecting to Firebase: [${process.env['FIREBASE_DATA_ROOT_URL']}]`);
            try {
                firebase.initializeApp({
                    credential: firebase.credential.cert(serviceAccount),
                    databaseURL: process.env['FIREBASE_DATA_ROOT_URL']
                });
                DB.isAuthorized = true;
            }
            catch (err) {
                if (err.message.indexOf('The default Firebase app already exists.') !== -1) {
                    console.warn('DB was already logged in, however flag had not been set!');
                    DB.isConnected = true;
                }
                else {
                    DB.isConnected = false;
                    console.warn('Problem connecting to Firebase', err);
                    throw new Error(err);
                }
            }
        }
        if (debugging) {
            firebase.database.enableLogging(typeof debugging === 'function'
                ? (message) => debugging(message)
                : (message) => console.log("[FIREBASE]", message));
        }
    }
}
DB.isConnected = false;
DB.isAuthorized = false;
exports.default = DB;
