"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _acornPrivateClassElements = _interopRequireDefault(require("acorn-private-class-elements"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _default(Parser) {
  var acorn = Parser.acorn || require("acorn");

  var tt = acorn.tokTypes;
  Parser = (0, _acornPrivateClassElements["default"])(Parser);
  return /*#__PURE__*/function (_Parser) {
    _inherits(_class, _Parser);

    var _super = _createSuper(_class);

    function _class() {
      _classCallCheck(this, _class);

      return _super.apply(this, arguments);
    }

    _createClass(_class, [{
      key: "_maybeParseFieldValue",
      value: function _maybeParseFieldValue(field) {
        if (this.eat(tt.eq)) {
          var oldInFieldValue = this._inFieldValue;
          this._inFieldValue = true;
          field.value = this.parseExpression();
          this._inFieldValue = oldInFieldValue;
        } else {
          field.value = null;
        }
      } // Parse fields

    }, {
      key: "parseClassElement",
      value: function parseClassElement(_constructorAllowsSuper) {
        if (this.options.ecmaVersion >= 8 && (this.type == tt.name || this.type.keyword || this.type == this.privateNameToken || this.type == tt.bracketL || this.type == tt.string || this.type == tt.num)) {
          var branch = this._branch();

          if (branch.type == tt.bracketL) {
            var count = 0;

            do {
              if (branch.eat(tt.bracketL)) {
                ++count;
              } else if (branch.eat(tt.bracketR)) {
                --count;
              } else {
                branch.next();
              }
            } while (count > 0);
          } else {
            branch.next(true);
          }

          if (branch.type == tt.eq || branch.canInsertSemicolon() || branch.type == tt.semi) {
            var node = this.startNode();

            if (this.type == this.privateNameToken) {
              this.parsePrivateClassElementName(node);
            } else {
              this.parsePropertyName(node);
            }

            if (node.key.type === "Identifier" && node.key.name === "constructor" || node.key.type === "Literal" && node.key.value === "constructor") {
              this.raise(node.key.start, "Classes may not have a field called constructor");
            } // eslint-disable-next-line no-bitwise


            this.enterScope(64 | 2 | 1); // See acorn's scopeflags.js

            this._maybeParseFieldValue(node);

            this.exitScope();
            this.finishNode(node, "FieldDefinition");
            this.semicolon();
            return node;
          }
        } // eslint-disable-next-line prefer-rest-params


        return _get(_getPrototypeOf(_class.prototype), "parseClassElement", this).apply(this, arguments);
      } // Prohibit arguments in class field initializers

    }, {
      key: "parseIdent",
      value: function parseIdent(liberal, isBinding) {
        var ident = _get(_getPrototypeOf(_class.prototype), "parseIdent", this).call(this, liberal, isBinding);

        if (this._inFieldValue && ident.name == "arguments") {
          this.raise(ident.start, "A class field initializer may not contain arguments");
        }

        return ident;
      }
    }]);

    return _class;
  }(Parser);
}