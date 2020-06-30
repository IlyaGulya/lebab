import createTestHelpers from '../createTestHelpers';
import stripIndent from 'strip-indent';

const {expectTransform, expectNoChange} = createTestHelpers(['class']);

describe('Classes', () => {
  it('should not convert functions without prototype assignment to class', () => {
    expectNoChange(
      'function myFunc() {\n' +
      '}'
    ).withoutWarnings();
  });

  it('should warn about functions that are named like classes', () => {
    expectNoChange(
      'function MyClass() {\n' +
      '}'
    ).withWarnings([
      {line: 1, msg: 'Function MyClass looks like class, but has no prototype', type: 'class'}
    ]);
  });

  it('should convert static function declarations with assignment to static class methods', () => {
    expectTransform(
      'function MyClass() {\n' +
      '}\n' +
      'MyClass.method = function(a, b) {\n' +
      '};'
    ).toReturn(
      'class MyClass {\n' +
      '  static method(a, b) {\n' +
      '  }\n' +
      '}'
    );
  });

  it('should convert static field declarations with assignment to static class fields', () => {
    expectTransform(
      'function MyClass() {\n' +
      '}\n' +
      'MyClass.field = "test"'
    ).toReturn(
      'class MyClass {\n' +
      '  static field = "test";\n' +
      '}'
    );
  });

  it('should ignore anonymous function declaration', () => {
    expectNoChange(
      'export default function () {}'
    );
  });

  describe('assignment to prototype field', () => {
    it('should convert to class (when function declaration used)', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = function(a, b) {\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  method(a, b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should convert to class (when function variable used)', () => {
      expectTransform(
        'var MyClass = function() {\n' +
        '};\n' +
        'MyClass.prototype.method = function() {\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  method() {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should convert to class (when anonymous construction function used)', () => {
      expectTransform(
        stripIndent(`
          const Test = function() {
              function a() {

              }

              a.prototype.test = function () {

              };
              return a
          }();
        `)).toReturn(stripIndent(`
          class Test {
              test() {

              }
          }
        `));
    });

    it('should convert to class (when double nested anonymous construction with extension function used)', () => {
      expectTransform(
        stripIndent(`
          var __extends;

          const Test = function(_super) {
              function a() {
                var t = _super.call(this) || this
                t.direction = null
                return t
              }

              __extends(a, _super)

              a.prototype.test = function () {

              };
              return a
          }(EventDispatcher);
        `)).toReturn(stripIndent(`
          class Test extends EventDispatcher {

            direction = null

            constructor() {

            }

            test() {

            }
          }
        `));
    });

    it('should not convert arrow-function to class', () => {
      expectNoChange(
        'var MyClass = () => {\n' +
        '  this.foo = 10;\n' +
        '};\n' +
        'MyClass.prototype.method = () => {\n' +
        '  return this.foo;\n' +
        '};'
      );
    });

    it('should not convert arrow-function to method when it uses this', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = () => {\n' +
        '  return this.foo;\n' +
        '};'
      );
    });

    it('should not convert arrow-function to method when it uses this inside nested arrow-function', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = () => {\n' +
        '  return () => { this.foo(); };\n' +
        '};'
      );
    });

    it('should convert arrow-function to method when it does not use this', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = () => {\n' +
        '  return foo;\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  method() {\n' +
        '    return foo;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should convert shorthand arrow-function to method when it does not use this', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = () => foo;'
      ).toReturn(
        'class MyClass {\n' +
        '  method() {\n' +
        '    return foo;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should convert non-empty function to constructor method', () => {
      expectTransform(
        'function MyClass(a, b) {\n' +
        '  this.params = [a, b];\n' +
        '}\n' +
        'MyClass.prototype.method = function(ma, mb) {\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  constructor(a, b) {\n' +
        '    this.params = [a, b];\n' +
        '  }\n' +
        '\n' +
        '  method(ma, mb) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should preserve "async" keyword when converting methods', () => {
      expectTransform(
        'function MyClass(a, b) {\n' +
        '  this.params = [a, b];\n' +
        '}\n' +
        'MyClass.prototype.method = async function(ma, mb) {\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  constructor(a, b) {\n' +
        '    this.params = [a, b];\n' +
        '  }\n' +
        '\n' +
        '  async method(ma, mb) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should not convert non-anonymous functions to methods', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = method;\n' +
        'function method(a, b) {\n' +
        '}'
      );
    });

    it('should ignore non-function assignments to prototype', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.count = 10;\n' +
        'MyClass.prototype.method = function() {\n' +
        '};\n' +
        'MyClass.prototype.hash = {foo: "bar"};'
      ).toReturn(
        'class MyClass {\n' +
        '  method() {\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'MyClass.prototype.count = 10;\n' +
        'MyClass.prototype.hash = {foo: "bar"};'
      );
    });
  });

  describe('object assigned to prototype', () => {
    it('should transform plain functions to methods', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  methodA: function(a) {\n' +
        '  },\n' +
        '  methodB: function(b) {\n' +
        '  }\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  methodA(a) {\n' +
        '  }\n' +
        '\n' +
        '  methodB(b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should move over ES6 methods', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  methodA(a) {\n' +
        '  },\n' +
        '  methodB(b) {\n' +
        '  }\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  methodA(a) {\n' +
        '  }\n' +
        '\n' +
        '  methodB(b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should move over getters/setters', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  get methodA() {\n' +
        '  },\n' +
        '  set methodB(b) {\n' +
        '  }\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  get methodA() {\n' +
        '  }\n' +
        '\n' +
        '  set methodB(b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should ignore when it contains non-functions', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  method: function(a) {\n' +
        '  },\n' +
        '  foo: 10\n' +
        '};'
      );
    });

    it('should ignore when it contains arrow-functions that use this', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  method: () => this.foo,\n' +
        '};'
      );
    });

    it('should transform when it contains arrow-functions that do not use this', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  method: () => foo,\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  method() {\n' +
        '    return foo;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should preserve "async" when converting arrow-functions', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype = {\n' +
        '  method: async () => foo,\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  async method() {\n' +
        '    return foo;\n' +
        '  }\n' +
        '}'
      );
    });
  });

  describe('Object.defineProperty', () => {
    it('should convert setters and getters', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'Object.defineProperty(MyClass.prototype, "someAccessor", {\n' +
        '  get: function () {\n' +
        '    return this._some;\n' +
        '  },\n' +
        '  set: function (value) {\n' +
        '    this._some = value;\n' +
        '  }\n' +
        '});'
      ).toReturn(
        'class MyClass {\n' +
        '  get someAccessor() {\n' +
        '    return this._some;\n' +
        '  }\n' +
        '\n' +
        '  set someAccessor(value) {\n' +
        '    this._some = value;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should ignore other options when converting get/set', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'Object.defineProperty(MyClass.prototype, "someAccessor", {\n' +
        '  configurable: true,\n' +
        '  enumerable: true,\n' +
        '  set: function (value) {\n' +
        '    this._some = value;\n' +
        '  }\n' +
        '});'
      ).toReturn(
        'class MyClass {\n' +
        '  set someAccessor(value) {\n' +
        '    this._some = value;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should convert', () => {
      expectTransform(`
(function (e) {
    var t;
    var n;
    var i = ns_gen5_util_logging.Timer;
    var r = ns_gen5_util_user.RegisteredCountry;
    var o = ns_gen5_util_logging.CounterLogger;
    var s = "overview_subscribe_brazil";
    var a = "overview_subscribe";
    var c = "socket_connection_brazil_";
    var l = "socket_connection_";

    var u = (function (u) {
        function h() {
            var e = u.call(this) || this;
            e._messageDispatcher = null;
            e._connectionID = "";
            e._connectionTimeout = 0;
            e._url = "";
            e._transportIsSupported = e.checkWebsocketAvailable();
            e._socket = null;
            e._socketReadyState = null;
            e._connected = !1;
            e.suspended = !1;
            e.storageId = null;
            e.tokenValidation = !1;
            e.subscriptionLogged = !1;

            e.socketOpenHandler = function (t) {
                e.log("Websocket: onopen: " + t.type);
                e.socketConnectCallback();
            };

            e.socketErrorHandler = function (t) {
                e.connectionFailed("connection error: " + t.type)
            };

            e.socketCloseHandler = function (t) {
                if (e._connected) {
                    e.connectionClosed("Websocket: onclosed: " + t.reason);
                } else {
                    e.connectionFailed("connection error: " + t.type + " (unable to connect error)");
                }
            };

            e.socketMessageHandshakeHandler = function (t) {
                e.connectionTimer.record();
                e.handshakeCallback(t.data);
            };

            e.socketMessageDataHandler = function (t) {
                if (!e.subscriptionLogged && e.subscriptionTimer && t.data.indexOf("OVInPlay")) {
                    e.subscriptionTimer.snapshotTimestampNow();
                }

                e.socketDataCallback(t.data);
            };

            return e;
        }

        __extends(h, u);

        h.prototype.toString = function () {
            return "[WebsocketTransportMethod]"
        };

        h.prototype.close = function () {
            if (this.getSocketConnected()) {
                var t = "";
                t += String.fromCharCode(e.StandardProtocolConstants.CLIENT_CLOSE);
                t += String.fromCharCode(0);
                this.put(t);
                this._socket.close();
            }
        };

        h.prototype.getConnected = function () {
            return this.getSocketConnected() && this._connected
        };

        h.prototype.getSocketConnected = function () {
            return this._transportIsSupported && this._socketReadyState == WebSocket.OPEN
        };

        h.prototype.setSocketReadyState = function () {
            this._socketReadyState = this._socket && this._socket.readyState ? this._socket.readyState : null;

            if (this._connected && this._socketReadyState !== WebSocket.OPEN) {
                this._connected = !1;
            }
        };

        h.prototype.connect = function (e, o, u) {
            var d = this;
            t = e;
            n = o;

            if (Locator.user.countryId == r.Brazil) {
                this.connectionMetricKey = c + u;
                this.subscriptionMetricKey = s;
            } else {
                this.connectionMetricKey = l + u;
                this.subscriptionMetricKey = a;
            }

            this._transportIsSupported || this.connectionFailed("Websocket Transport not supported.");
            if (null == this._socket) {
                this._connectionTimeout = setTimeout((function () {
                    d.connectionFailed("timeout after " + h.CONNECTION_TIMEOUT_LIMIT + "ms")
                }), h.CONNECTION_TIMEOUT_LIMIT);
                try {
                    this._url = this._connectionDetails.host + ":" + this._connectionDetails.port + h.TRAILING + "?uid=" + this._connectionDetails.uid;
                    this.connectionTimer = new i(this.connectionMetricKey);
                    this._socket = new WebSocket(this._url, "zap-protocol-v1");
                    this._socket.addEventListener("open", this.socketOpenHandler);
                    this._socket.addEventListener("error", this.socketErrorHandler);
                    this._socket.addEventListener("close", this.socketCloseHandler);
                } catch (p) {
                    this.connectionFailed("Unable to open Socket. Error: " + p)
                }
            }
        };

        h.prototype.socketConnectCallback = function () {
            var e;
            var t = this;
            this.clearConnectionTimeout();
            this.setSocketReadyState();

            if (this.getSocketConnected()) {
                this._socket.addEventListener("message", this.socketMessageHandshakeHandler);
                e = this.getHandshakeData();

                if (e) {
                    this._socket.send(e);

                    this._connectionTimeout = setTimeout((function () {
                        t.connectionFailed("timeout after " + h.HANDSHAKE_TIMEOUT_LIMIT + "ms")
                    }), h.HANDSHAKE_TIMEOUT_LIMIT);
                } else {
                    this.close();
                }
            } else {
                this.connectionFailed("not connected");
            }
        };

        h.prototype.handshakeCallback = function (t) {
            var n = t.split(e.StandardProtocolConstants.HANDSHAKE_MESSAGE_DELIM);
            var i = n[0];
            var r = i.split(e.StandardProtocolConstants.FIELD_DELIM);
            this._socket.removeEventListener("message", this.socketMessageHandshakeHandler);
            this.clearConnectionTimeout();
            return r[0] != h.HANDSHAKE_STATUS_CONNECTED ? r[0] == h.HANDSHAKE_STATUS_REJECTED ? void this.connectionFailed("connection rejected " + h.HANDSHAKE_STATUS_REJECTED) : void this.connectionFailed("connection rejected - unrecognised response") : (this.setSocketReadyState(), this._connected = !0, this._connectionID = r[1], this.dispatchEvent(new e.TransportConnectionEvent(e.TransportConnectionEvent.CONNECTED)), this.log("Websocket connected as " + this._connectionID + ". " + this._connectionDetails), void this._socket.addEventListener("message", this.socketMessageDataHandler));
        };

        h.prototype.socketDataCallback = function (t) {
            var n;
            var i;
            var r;
            var o;
            var s;
            var a;
            var c;
            var l;
            try {
                if (t) {
                    n = t.split(e.StandardProtocolConstants.MESSAGE_DELIM);
                    do {
                        i = n.shift();
                        switch (r = i.charCodeAt(0)) {
                        case e.StandardProtocolConstants.INITIAL_TOPIC_LOAD:
                        case e.StandardProtocolConstants.DELTA:
                            o = i.split(e.StandardProtocolConstants.RECORD_DELIM), s = o[0].split(e.StandardProtocolConstants.FIELD_DELIM), a = s.shift(), c = a.substr(1, a.length), l = i.substr(o[0].length + 1), !this.subscriptionLogged && t.indexOf("OVInPlay") > -1 && this.subscriptionTimer && (this.subscriptionTimer.record(), this.subscriptionLogged = !0), null !== this._messageDispatcher && this._messageDispatcher.dispatchEvent(new e.ReaditMessageEvent(e.ReaditMessageEvent.MESSAGE_RECEIVED, new e.ReaditMessage(String(r), c, l, s)));
                            break;
                        case e.StandardProtocolConstants.CLIENT_ABORT:
                        case e.StandardProtocolConstants.CLIENT_CLOSE:
                            this.connectionFailed("Connection close/abort message type sent from publisher. Message type: " + r);
                            break;
                        default:
                            this.log("Unrecognised message type sent from publisher: " + r)
                        }
                    } while (n.length);
                }
            } catch (u) {
                this.log(u.toString())
            }
        };

        h.prototype.subscribe = function (t) {
            var n = "";
            n += String.fromCharCode(e.StandardProtocolConstants.CLIENT_SUBSCRIBE);
            n += String.fromCharCode(e.StandardProtocolConstants.NONE_ENCODING);
            n += t;
            n += e.StandardProtocolConstants.RECORD_DELIM;
            this.put(n);
        };

        h.prototype.unsubscribe = function (t) {
            var n = "";
            n += String.fromCharCode(e.StandardProtocolConstants.CLIENT_UNSUBSCRIBE);
            n += String.fromCharCode(e.StandardProtocolConstants.NONE_ENCODING);
            n += t;
            n += e.StandardProtocolConstants.RECORD_DELIM;
            this.put(n);
        };

        h.prototype.swapSubscription = function (e, t) {
            this.unsubscribe(t);
            this.subscribe(e);
        };

        h.prototype.send = function (t, n) {
            var i = "";
            i += String.fromCharCode(e.StandardProtocolConstants.CLIENT_SEND);
            i += String.fromCharCode(e.StandardProtocolConstants.NONE_ENCODING);
            i += t;
            i += e.StandardProtocolConstants.RECORD_DELIM;
            i += n;
            this.put(i);
        };

        h.prototype.put = function (e) {
            try {
                if (!this.getSocketConnected()) {
                    throw new Error("socket not connected");
                }

                if (!this.subscriptionLogged && e.indexOf("OVInPlay") > -1) {
                    this.subscriptionTimer = new i(this.subscriptionMetricKey);
                }

                this._socket.send(e);
            } catch (t) {
                this.connectionFailed("WebSocket: put:" + t)
            }
        };

        h.prototype.getHandshakeData = function () {
            var i;
            var r;
            var s = "";
            s += String.fromCharCode(h.HANDSHAKE_PROTOCOL);
            s += String.fromCharCode(h.HANDSHAKE_VERSION);
            s += String.fromCharCode(h.HANDSHAKE_CONNECTION_TYPE);
            s += String.fromCharCode(h.HANDSHAKE_CAPABILITIES_FLAG);

            if (null != this._connectionDetails.defaultTopic) {
                s += this._connectionDetails.defaultTopic + ",";
            }

            i = ns_gen5_util.CookieManager.GetSessionId();
            if (null == i) {
                this.dispatchEvent(new e.TransportConnectionEvent(e.TransportConnectionEvent.CONNECTION_FAILED_INVALID_SESSION));
                return null;
            }
            s += "S_" + i;
            if (this.tokenValidation) {
                if (n && Date.now() / 1e3 > n()) {
                    o.QueueCounter("nst_timestamp_3_count", 1);
                    o.ForceCounterFlush();

                    Locator.validationManager.callNewContext((function () {
                        location.reload()
                    }));

                    return null;
                }
                r = t && t();

                if (r) {
                    s += ",D_" + r;
                }
            }
            return s += String.fromCharCode(0)
        };

        h.prototype.checkWebsocketAvailable = function () {
            return "WebSocket" in window
        };

        h.prototype.getConnectionId = function () {
            return this._connectionID
        };

        h.prototype.getConnectionDetails = function () {
            return this._connectionDetails
        };

        h.prototype.setConnectionDetails = function (e) {
            this._connectionDetails = e
        };

        h.prototype.setMessageDispatcher = function (e) {
            this._messageDispatcher = e
        };

        h.prototype.log = function (t) {
            e.ReadItLog.Log(this + " -> " + t)
        };

        h.prototype.clearConnectionTimeout = function () {
            if (this._connectionTimeout) {
                clearTimeout(this._connectionTimeout);
                this._connectionTimeout = null;
            }
        };

        h.prototype.connectionFailed = function (t) {
            this.log("Websocket connection (" + this._connectionDetails + ") failed - " + t);
            this.clearConnectionTimeout();
            return this.getConnected() ? void this.connectionClosed("connection failed") : (this.setSocketReadyState(), this.dispose(), void this.dispatchEvent(new e.TransportConnectionEvent(e.TransportConnectionEvent.CONNECTION_FAILED)));
        };

        h.prototype.connectionClosed = function (t) {
            this.log("Websocket connection (" + this._connectionDetails + ") closed - " + t);
            this.clearConnectionTimeout();
            this.setSocketReadyState();
            this.dispose();
            this.dispatchEvent(new e.TransportConnectionEvent(e.TransportConnectionEvent.DISCONNECTED));
        };

        h.prototype.dispose = function () {
            this.close();

            if (this._socket) {
                this._socket.removeEventListener("open", this.socketOpenHandler);
                this._socket.removeEventListener("close", this.socketCloseHandler);
                this._socket.removeEventListener("error", this.socketErrorHandler);
                this._socket.removeEventListener("message", this.socketMessageDataHandler);
                this._socket.removeEventListener("message", this.socketMessageHandshakeHandler);
                this._socket = null;
            }
        };

        h.TRAILING = "/zap/";
        h.CONNECTION_TIMEOUT_LIMIT = 15e3;
        h.HANDSHAKE_TIMEOUT_LIMIT = 15e3;
        h.HANDSHAKE_PROTOCOL = 35;
        h.HANDSHAKE_VERSION = 3;
        h.HANDSHAKE_CONNECTION_TYPE = 80;
        h.HANDSHAKE_CAPABILITIES_FLAG = 1;
        h.HANDSHAKE_STATUS_CONNECTED = "100";
        h.HANDSHAKE_STATUS_REJECTED = "111";
        return h;
    })(ns_gen5_events.EventDispatcher);

    e.WebsocketTransportMethod = u
})      `).toReturn(
        'class MyClass {\n' +
        '  set someAccessor(value) {\n' +
        '    this._some = value;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should ignore non-function property', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'Object.defineProperty(MyClass.prototype, "propName", {\n' +
        '  value: 10,\n' +
        '  configurable: true,\n' +
        '  writable: true\n' +
        '});'
      );
    });

    it('should transform arrow-function that does not use this', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        'Object.defineProperty(MyClass.prototype, "getter", {\n' +
        '  get: () => something\n' +
        '});'
      ).toReturn(
        'class MyClass {\n' +
        '  get getter() {\n' +
        '    return something;\n' +
        '  }\n' +
        '}'
      );
    });

    it('should ignore arrow-function that uses this', () => {
      expectNoChange(
        'function MyClass() {\n' +
        '}\n' +
        'Object.defineProperty(MyClass.prototype, "getter", {\n' +
        '  get: () => this.something\n' +
        '});'
      );
    });
  });

  describe('comments', () => {
    it('should preserve class comments', () => {
      expectTransform(
        '/** My nice class. */\n' +
        'function MyClass() {\n' +
        '}\n' +
        'MyClass.prototype.method = function(a, b) {\n' +
        '};'
      ).toReturn(
        '/** My nice class. */\n' +
        'class MyClass {\n' +
        '  method(a, b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should preserve method comments', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        '/** My nice method. */\n' +
        'MyClass.prototype.method = function(a, b) {\n' +
        '};'
      ).toReturn(
        'class MyClass {\n' +
        '  /** My nice method. */\n' +
        '  method(a, b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should preserve class with constructor comments', () => {
      expectTransform(
        '/** My nice class. */\n' +
        'function MyClass() {\n' +
        '  this.foo = 1;\n' +
        '}\n' +
        'MyClass.prototype.method = function(a, b) {\n' +
        '};'
      ).toReturn(
        '/** My nice class. */\n' +
        'class MyClass {\n' +
        '  constructor() {\n' +
        '    this.foo = 1;\n' +
        '  }\n' +
        '\n' +
        '  method(a, b) {\n' +
        '  }\n' +
        '}'
      );
    });

    it('should preserve multiple comments in various places', () => {
      expectTransform(
        '// My class\n' +
        '// it is nice\n' +
        'function MyClass() {\n' +
        '}\n' +
        '// comment after constructor-function\n' +
        '\n' +
        '// Look me, a method!\n' +
        '// it is nice too\n' +
        'MyClass.prototype.method = function(a, b) {\n' +
        '};\n' +
        '// and even some comments in here'
      ).toReturn(
        '// My class\n' +
        '// it is nice\n' +
        'class MyClass {\n' +
        '  // comment after constructor-function\n' +
        '\n' +
        '  // Look me, a method!\n' +
        '  // it is nice too\n' +
        '  method(a, b) {\n' +
        '  }\n' +
        '  // and even some comments in here\n' +
        '}'
      );
    });

    it('should preserve prototype = {} comments', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        '// comment before\n' +
        'MyClass.prototype = {\n' +
        '  // comment A\n' +
        '  methodA: function() {},\n' +
        '  // comment B\n' +
        '  methodB: function() {}\n' +
        '};\n'
      ).toReturn(
        'class MyClass {\n' +
        '  // comment before\n' +
        '  // comment A\n' +
        '  methodA() {}\n' +
        '\n' +
        '  // comment B\n' +
        '  methodB() {}\n' +
        '}\n'
      );
    });

    it('should preserve Object.defineProperty comments', () => {
      expectTransform(
        'function MyClass() {\n' +
        '}\n' +
        '// Comment before\n' +
        'Object.defineProperty(MyClass.prototype, "someAccessor", {\n' +
        '  // Getter comment\n' +
        '  get: function() {},\n' +
        '  // Setter comment\n' +
        '  set: function() {}\n' +
        '});'
      ).toReturn(
        'class MyClass {\n' +
        '  // Comment before\n' +
        '  // Getter comment\n' +
        '  get someAccessor() {}\n' +
        '\n' +
        '  // Setter comment\n' +
        '  set someAccessor() {}\n' +
        '}'
      );
    });
  });
});
