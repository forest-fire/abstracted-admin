import * as firebase from 'firebase-admin';
import { IDictionary } from 'common-types';
import * as convert from 'typed-conversions';
import moment = require('moment');
import * as process from 'process';

export enum FirebaseBoolean {
  true = 1, 
  false = 0 
}

export type Snapshot = firebase.database.DataSnapshot;
export type Reference = firebase.database.Reference;

const findRecord = {

  first: (hash: IDictionary) => {
    const exists = Object.keys(hash).length > 0;
    return exists
      ? hash[Object.keys(hash)[0]]
      : undefined;
  },

  mostRecent: (hash: IDictionary) => {
    const exists = Object.keys(hash).length > 0;
    return exists
      ? hash[Object.keys(hash).sort()[0]]
      : undefined;
  },

  oldest: (hash: IDictionary) => {
    const exists = Object.keys(hash).length > 0;
    return exists
      ? hash[Object.keys(hash).sort().reverse()[0]]
      : undefined;
  },
};

export default class DB {
  private static isConnected: boolean = false;
  private static isAuthorized: boolean = false;
  private static connection: firebase.database.Database;
  public auth: firebase.auth.Auth;
  private mocking: boolean = false;
  private _waitingForConnection: Array<() => void> = [];

  constructor(debugging = false) {
    this.connect(debugging);
    this.auth = firebase.auth();
    DB.connection = firebase.database();
    firebase.database().goOnline();
    firebase.database().ref('.info/connected').on('value', (snap) => {
      DB.isConnected = snap.val();
      this._waitingForConnection.forEach(cb => cb());
      this._waitingForConnection = [];
    });
  }

  /** Get a DB reference for a given path in Firebase */
  public ref(path: string): firebase.database.Reference {
    return DB.connection.ref(path);
  }

  public async waitForConnection() {
    if (DB.isConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const cb = () => {
        resolve();
      };
      this._waitingForConnection.push(cb);
    });
  }

  public get isConnected() {
    return DB.isConnected;
  }

  /** set a "value" in the database at a given path */
  public async set(path: string, value: any): Promise<void> {
    return this.ref(path).set(value)
      .catch(e => this.handleError(e, 'set', `setting value @ "${path}"`));
  }

  public async update<T = IDictionary>(path: string, value: T) {
    return this.ref(path).update(value);
  }

  public async remove(path: string, ignoreMissing = false): Promise<void> {
    const ref = this.ref(path); 
    
    return ref.remove()
      .catch(e => {
        if (ignoreMissing && e.message.indexOf('key is not defined') !== -1) {
          return Promise.resolve();
        }
         
        this.handleError(
          e, 
          'remove', 
          `attempt to remove ${path} failed: `
        );
      });
  }

  public async getSnapshot(path: string): Promise<firebase.database.DataSnapshot> {
    return this.ref(path).once('value');
  }

  /** returns the value at the given path in the database */
  public async getValue<T = any>(path: string): Promise<T> {
    const snap = await this.getSnapshot(path);
    return snap.val() as T;
  }

  /**
   * Gets a snapshot from a given path in the DB
   * and converts it to a JS object where the key 
   * is converted to be the "id" property of the 
   * object.
   */
  public async getRecord<T = any>(path: string): Promise<T> {
    return this.getSnapshot(path)
      .then(snap => convert.snapshotToHash(snap) as T);
  }

  /** 
   * Pushes a value (typically a hash) under a given path in the 
   * database but allowing Firebase to insert a unique "push key" 
   * to ensure the value is placed into a Dictionary/Hash structure
   * of the form of "/{path}/{pushkey}/{value}"
   */
  public async push<T = IDictionary<any>>(path: string, value: T) {
    return this.ref(path).push(value);
  }

  /** validates the existance of a path in the database */
  public async exists(path: string): Promise<boolean> {
    return this.getSnapshot(path)
      .then(snap => snap.val() ? true : false);
  }

  private handleError(e: any, name: string, message = '') {
      console.error(`Error ${message}:`, e);
      return Promise.reject({
        code: `firebase/${name}`,
        message: message + e.message || e
      });
  }

  private connect(debugging: boolean = false): void {
    
    if (!DB.isAuthorized) {
      // if (!process.env['AWS_STAGE']) {
      //   throw new Error('The AWS_STAGE variable was not set!');
      // }
      const serviceAcctEncoded = process.env['FIREBASE_SERVICE_ACCOUNT'];      
      if (!serviceAcctEncoded) {
        throw new Error('Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key.');
      }
      
      const serviceAccount: firebase.ServiceAccount = JSON.parse(
        Buffer
          .from(process.env['FIREBASE_SERVICE_ACCOUNT'], 'base64')
          .toString()
      );
        
      console.log(
        `Connecting to Firebase: [${process.env['FIREBASE_DATA_ROOT_URL']}]`
      );
      try { 
        firebase.initializeApp({
          credential: firebase.credential.cert(serviceAccount),
          databaseURL: process.env['FIREBASE_DATA_ROOT_URL']
        });
        DB.isAuthorized = true;
      } catch (err) {
        if (err.message.indexOf('The default Firebase app already exists.') !== -1) {
          console.warn('DB was already logged in, however flag had not been set!');
          DB.isConnected = true;
        } else {
          DB.isConnected = false;
          console.warn('Problem connecting to Firebase', err);
          throw new Error(err);
        }
      }
    } 

    if (debugging) {
      console.log('Firebase debugging enabled');
      
      firebase.database.enableLogging((message) => {
        console.log("[FIREBASE]", message);
      });
    }
  }
}
