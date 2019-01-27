import serializedQuery from 'serialized-query';
import abstractedFirebase from 'abstracted-firebase';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  _setPrototypeOf(subClass.prototype, superClass && superClass.prototype);

  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) {
    return o.__proto__;
  };

  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

var firebase = require("firebase-admin");

var process = require("process");

var abstracted_firebase_1 = require("abstracted-firebase");

var EventManager_1 = require("./EventManager");

var util_1 = require("./util");

var zlib_1 = require("zlib");

var util_2 = require("util");

var gunzipAsync = util_2.promisify(zlib_1.gunzip);

var DB =
/*#__PURE__*/
function (_abstracted_firebase_) {
  _createClass(DB, null, [{
    key: "connect",
    value: function connect(config) {
      return new Promise(function ($return, $error) {
        var obj;
        obj = new DB(config);
        return Promise.resolve(obj.waitForConnection()).then(function ($await_6) {
          try {
            return $return(obj);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }, $error);
      });
    }
  }]);

  function DB(config) {
    var _this;

    _classCallCheck(this, DB);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DB).call(this));
    _this._eventManager = new EventManager_1.EventManager();
    var defaults = {
      name: "[DEFAULT]"
    };

    if (process.env["FIREBASE_SERVICE_ACCOUNT"]) {
      defaults.serviceAccount = process.env["FIREBASE_SERVICE_ACCOUNT"];
    }

    if (process.env["FIREBASE_DATA_ROOT_URL"]) {
      defaults.databaseUrl = process.env["FIREBASE_DATA_ROOT_URL"];
    }

    config = Object.assign({}, defaults, config || {});

    if (!config.mocking && (!config.serviceAccount || !config.databaseUrl)) {
      var e = new Error("You must have both the serviceAccount and databaseUrl set if you are starting a non-mocking database. You can include these as ENV variables or pass them with the constructor's configuration hash");
      e.name = "AbstractedAdmin::InsufficientDetails";
      throw e;
    }

    _this.initialize(config);

    return _this;
  }

  _createClass(DB, [{
    key: "goOnline",
    value: function goOnline() {
      try {
        this._database.goOnline();
      } catch (e) {
        util_1.debug("There was an error going online:" + e);
      }
    }
  }, {
    key: "goOffline",
    value: function goOffline() {
      this._database.goOffline();
    }
  }, {
    key: "connectToFirebase",
    value: function connectToFirebase(config) {
      return new Promise(function ($return, $error) {
        var _this2, serviceAcctEncoded, serviceAccount, name, runningApps;

        _this2 = this;

        if (!this._isAuthorized) {
          return Promise.resolve(new Promise(function ($return, $error) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_COMPRESSED) {
              return Promise.resolve(gunzipAsync(Buffer.from(config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"]))).then(function ($await_7) {
                try {
                  return $return($await_7.toString("utf-8"));
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }, $error);
            }

            return $return(config.serviceAccount || process.env["FIREBASE_SERVICE_ACCOUNT"]);
          })).then(function ($await_8) {
            try {
              serviceAcctEncoded = $await_8;

              if (!serviceAcctEncoded) {
                return $error(new Error("Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key or pass it in explicitly as part of the config object."));
              }

              serviceAccount = JSON.parse(Buffer.from(config.serviceAccount ? config.serviceAccount : process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString());
              console.log("Connecting to Firebase: [".concat(process.env["FIREBASE_DATA_ROOT_URL"], "]"));

              try {
                name = config.name;
                runningApps = new Set(firebase.apps.map(function (i) {
                  return i.name;
                }));
                util_1.debug("AbstractedAdmin: the DB \"".concat(name, "\" ") + runningApps.has(name) ? "appears to be already connected" : "has not yet been connected");
                this.app = runningApps.has(name) ? firebase.app() : firebase.initializeApp({
                  credential: firebase.credential.cert(serviceAccount),
                  databaseURL: config.databaseUrl
                });
                this._isAuthorized = true;
                this._database = firebase.database();
                this.enableDatabaseLogging = firebase.database.enableLogging.bind(firebase.database);
                this.app = firebase;
                this.goOnline();
                new EventManager_1.EventManager().connection(true);

                this._database.ref(".info/connected").on("value", function (snap) {
                  _this2._isConnected = snap.val();

                  _this2._waitingForConnection.forEach(function (cb) {
                    return cb();
                  });

                  _this2._waitingForConnection = [];

                  if (_this2.isConnected) {
                    util_1.debug("AbstractedAdmin: connected to ".concat(name));

                    _this2._onConnected.forEach(function (listener) {
                      return listener.cb(_this2);
                    });
                  } else {
                    util_1.debug("AbstractedAdmin: disconnected from ".concat(name));

                    _this2._onDisconnected.forEach(function (listener) {
                      return listener.cb(_this2);
                    });
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

              return $If_4.call(this);
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        }

        function $If_4() {
          if (config.debugging) {
            this.enableDatabaseLogging(typeof config.debugging === "function" ? function (message) {
              return config.debugging(message);
            } : function (message) {
              return console.log("[FIREBASE]", message);
            });
          }

          return $return();
        }

        return $If_4.call(this);
      }.bind(this));
    }
  }, {
    key: "listenForConnectionStatus",
    value: function listenForConnectionStatus() {
      return new Promise(function ($return, $error) {
        var _this3 = this;

        return $return(new Promise(function (resolve) {
          var cb = function cb() {
            resolve();
          };

          _this3._waitingForConnection.push(cb);
        }));
      }.bind(this));
    }
  }, {
    key: "auth",
    get: function get() {
      return abstracted_firebase_1._getFirebaseType(this, "auth");
    }
  }, {
    key: "firestore",
    get: function get() {
      return abstracted_firebase_1._getFirebaseType(this, "firestore");
    }
  }, {
    key: "database",
    get: function get() {
      return abstracted_firebase_1._getFirebaseType(this, "database");
    }
  }, {
    key: "messaging",
    get: function get() {
      return abstracted_firebase_1._getFirebaseType(this, "messaging");
    }
  }, {
    key: "storage",
    get: function get() {
      return abstracted_firebase_1._getFirebaseType(this, "storage");
    }
  }]);

  _inherits(DB, _abstracted_firebase_);

  return DB;
}(abstracted_firebase_1.RealTimeDB);

exports.DB = DB;

var db = /*#__PURE__*/Object.freeze({

});

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});



exports.SerializedQuery = serializedQuery.SerializedQuery;



exports.DB = db.DB;



exports.RealTimeDB = abstractedFirebase.RealTimeDB;
exports.FirebaseBoolean = abstractedFirebase.FirebaseBoolean;
});

var index = unwrapExports(lib);
var lib_1 = lib.SerializedQuery;
var lib_2 = lib.DB;
var lib_3 = lib.RealTimeDB;
var lib_4 = lib.FirebaseBoolean;

export default index;
export { lib_1 as SerializedQuery, lib_2 as DB, lib_3 as RealTimeDB, lib_4 as FirebaseBoolean };
