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

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var firebase = require("firebase-admin");

var process = require("process");

var abstracted_firebase_1 = require("abstracted-firebase");

var FirebaseBoolean;

(function (FirebaseBoolean) {
  FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
  FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean = exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));

var DB =
/*#__PURE__*/
function (_abstracted_firebase_) {
  function DB() {
    var _this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DB);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DB).call(this, config));

    if (!config.mocking) {
      _this.connect(config.debugging);

      abstracted_firebase_1.RealTimeDB.connection = firebase.database();
      firebase.database().goOnline();
      firebase.database().ref(".info/connected").on("value", function (snap) {
        DB.isConnected = snap.val();

        _this._waitingForConnection.forEach(function (cb) {
          return cb();
        });

        _this._waitingForConnection = [];

        if (DB.isConnected) {
          _this._onConnected.forEach(function (listener) {
            return listener.cb(_assertThisInitialized(_assertThisInitialized(_this)));
          });
        } else {
          _this._onDisconnected.forEach(function (listener) {
            return listener.cb(_assertThisInitialized(_assertThisInitialized(_this)));
          });
        }
      });
    }

    return _this;
  }

  _createClass(DB, [{
    key: "waitForConnection",
    value: function waitForConnection() {
      return __awaiter(this, void 0, void 0, function* () {
        var _this2 = this;

        if (DB.isConnected) {
          return Promise.resolve();
        }

        return new Promise(function (resolve) {
          var cb = function cb() {
            resolve();
          };

          _this2._waitingForConnection.push(cb);
        });
      });
    }
  }, {
    key: "connect",
    value: function connect() {
      var debugging = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!DB.isAuthorized) {
        var serviceAcctEncoded = process.env["FIREBASE_SERVICE_ACCOUNT"];

        if (!serviceAcctEncoded) {
          throw new Error("Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key.");
        }

        var serviceAccount = JSON.parse(Buffer.from(process.env["FIREBASE_SERVICE_ACCOUNT"], "base64").toString());
        console.log("Connecting to Firebase: [".concat(process.env["FIREBASE_DATA_ROOT_URL"], "]"));

        try {
          firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL: process.env["FIREBASE_DATA_ROOT_URL"]
          });
          DB.isAuthorized = true;
        } catch (err) {
          if (err.message.indexOf("The default Firebase app already exists.") !== -1) {
            console.warn("DB was already logged in, however flag had not been set!");
            DB.isConnected = true;
          } else {
            DB.isConnected = false;
            console.warn("Problem connecting to Firebase", err);
            throw new Error(err);
          }
        }
      }

      if (debugging) {
        firebase.database.enableLogging(typeof debugging === "function" ? function (message) {
          return debugging(message);
        } : function (message) {
          return console.log("[FIREBASE]", message);
        });
      }
    }
  }, {
    key: "isConnected",
    get: function get() {
      return DB.isConnected;
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
exports.default = db.DB;

var db_2 = db;

exports.DB = db_2.DB;
exports.FirebaseBoolean = db_2.FirebaseBoolean;



exports.RealTimeDB = abstractedFirebase.RealTimeDB;
});

var index = unwrapExports(lib);
var lib_1 = lib.SerializedQuery;
var lib_2 = lib.DB;
var lib_3 = lib.FirebaseBoolean;
var lib_4 = lib.RealTimeDB;

export default index;
export { lib_1 as SerializedQuery, lib_2 as DB, lib_3 as FirebaseBoolean, lib_4 as RealTimeDB };
