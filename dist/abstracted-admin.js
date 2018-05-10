(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('abstracted-firebase')) :
	typeof define === 'function' && define.amd ? define(['exports', 'abstracted-firebase'], factory) :
	(factory((global.abstractedAdmin = {}),global.abstractedFirebase));
}(this, (function (exports,abstractedFirebase) { 'use strict';

	abstractedFirebase = abstractedFirebase && abstractedFirebase.hasOwnProperty('default') ? abstractedFirebase['default'] : abstractedFirebase;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

	var serializedQuery = createCommonjsModule(function (module, exports) {
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	function slashNotation(path) {
	    return path.replace(/\./g, "/");
	}
	exports.slashNotation = slashNotation;
	class SerializedQuery {
	    constructor(path = "/") {
	        this._orderBy = "orderByKey";
	        this._path = typeof path === "string" ? slashNotation(path) : path;
	    }
	    static path(path = "/") {
	        return new SerializedQuery(path);
	    }
	    get path() {
	        return this._path;
	    }
	    setPath(path) {
	        this._path = typeof path === "string" ? slashNotation(path) : path;
	        return this;
	    }
	    limitToFirst(num) {
	        this._limitToFirst = num;
	        return this;
	    }
	    limitToLast(num) {
	        this._limitToLast = num;
	        return this;
	    }
	    orderByChild(child) {
	        this._orderBy = "orderByChild";
	        this._orderKey = child;
	        return this;
	    }
	    orderByValue() {
	        this._orderBy = "orderByValue";
	        return this;
	    }
	    orderByKey() {
	        this._orderBy = "orderByKey";
	        return this;
	    }
	    startAt(value, key) {
	        this.validateNoKey("startAt", key);
	        this._startAt = value;
	        return this;
	    }
	    endAt(value, key) {
	        this.validateNoKey("endAt", key);
	        this._endAt = value;
	        return this;
	    }
	    equalTo(value, key) {
	        this.validateNoKey("equalTo", key);
	        this._equalTo = value;
	        return this;
	    }
	    setDB(db) {
	        this.db = db;
	        return this;
	    }
	    deserialize(db) {
	        if (!db) {
	            db = this.db;
	        }
	        let q = db.ref(typeof this._path === "function" ? slashNotation(this._path()) : this._path);
	        switch (this._orderBy) {
	            case "orderByKey":
	                q = q.orderByKey();
	                break;
	            case "orderByValue":
	                q = q.orderByValue();
	                break;
	            case "orderByChild":
	                q = q.orderByChild(this._orderKey);
	                break;
	        }
	        if (this._limitToFirst) {
	            q = q.limitToFirst(this._limitToFirst);
	        }
	        if (this._limitToLast) {
	            q = q.limitToLast(this._limitToLast);
	        }
	        if (this._startAt) {
	            q = q.startAt(this._startAt);
	        }
	        if (this._endAt) {
	            q = q.endAt(this._endAt);
	        }
	        if (this._startAt) {
	            q = q.startAt(this._startAt);
	        }
	        if (this._equalTo) {
	            q = q.equalTo(this._equalTo);
	        }
	        return q;
	    }
	    handleSnapshot(fn) {
	        this._handleSnapshot = fn;
	        return this;
	    }
	    execute() {
	        return __awaiter(this, void 0, void 0, function* () {
	            const snap = yield this.deserialize().once("value");
	            return this._handleSnapshot ? this._handleSnapshot(snap) : snap;
	        });
	    }
	    where(operation, value) {
	        switch (operation) {
	            case "=":
	                return this.equalTo(value);
	            case ">":
	                return this.startAt(value);
	            case "<":
	                return this.endAt(value);
	            default:
	                const e = new Error(`Unknown comparison operator: ${operation}`);
	                e.code = "invalid-operator";
	                throw e;
	        }
	    }
	    toJSON() {
	        return JSON.stringify({
	            orderBy: this._orderBy,
	            orderByKey: this._orderKey,
	            limitToFirst: this._limitToFirst,
	            limitToLast: this._limitToLast,
	            startAt: this._startAt,
	            endAt: this._endAt,
	            equalTo: this._equalTo,
	            path: this._path
	        });
	    }
	    toString() {
	        return JSON.stringify({
	            orderBy: this._orderBy,
	            orderByKey: this._orderKey,
	            limitToFirst: this._limitToFirst,
	            limitToLast: this._limitToLast,
	            startAt: this._startAt,
	            endAt: this._endAt,
	            equalTo: this._equalTo,
	            path: this._path
	        }, null, 2);
	    }
	    validateNoKey(caller, key) {
	        if (key && this._orderBy === "orderByKey") {
	            throw new Error(`You can not use the "key" parameter with ${caller}() when using the ${this._orderBy} sort.`);
	        }
	    }
	}
	exports.SerializedQuery = SerializedQuery;

	});

	unwrapExports(serializedQuery);
	var serializedQuery_1 = serializedQuery.slashNotation;
	var serializedQuery_2 = serializedQuery.SerializedQuery;

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

	exports.default = index;
	exports.SerializedQuery = lib_1;
	exports.DB = lib_2;
	exports.FirebaseBoolean = lib_3;
	exports.RealTimeDB = lib_4;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
