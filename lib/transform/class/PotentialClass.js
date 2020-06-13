"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fp = require("lodash/fp");

var _extractComments = _interopRequireDefault(require("./extractComments"));

var _multiReplaceStatement = _interopRequireDefault(require("./../../utils/multiReplaceStatement"));

var _matchAnonymousClassConstructionFunction = _interopRequireDefault(require("./matchAnonymousClassConstructionFunction"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Represents a potential class to be created.
 */
var PotentialClass = /*#__PURE__*/function () {
  /**
   * @param {Object} cfg
   *   @param {String} cfg.name Class name
   *   @param {Object} cfg.fullNode Node to remove after converting to class
   *   @param {Object[]} cfg.commentNodes Nodes to extract comments from
   *   @param {Object} cfg.parent
   */
  function PotentialClass(_ref) {
    var name = _ref.name,
        fullNode = _ref.fullNode,
        commentNodes = _ref.commentNodes,
        parent = _ref.parent;

    _classCallCheck(this, PotentialClass);

    this.name = name;
    this.constructor = undefined;
    this.fullNode = fullNode;
    this.superClass = undefined;
    this.commentNodes = commentNodes;
    this.parent = parent;
    this.methods = [];
    this.fields = [];
    this.replacements = [];
    this.superCall = undefined;
    this.superCallArgs = [];
  }
  /**
   * Returns the name of the class.
   * @return {String}
   */


  _createClass(PotentialClass, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
    /**
     * Returns the AST node for the original function
     * @return {Object}
     */

  }, {
    key: "getFullNode",
    value: function getFullNode() {
      return this.fullNode;
    }
    /**
     * Set the constructor.
     * @param {PotentialMethod} method.
     */

  }, {
    key: "setConstructor",
    value: function setConstructor(method) {
      this.constructor = method;
    }
    /**
     * Set the superClass and set up the related assignment expressions to be
     * removed during transformation.
     * @param {Node} superClass           The super class node.
     * @param {Node[]} relatedExpressions The related expressions to be removed
     *                                    during transformation.
     */

  }, {
    key: "setSuperClass",
    value: function setSuperClass(superClass, relatedExpressions) {
      this.superClass = superClass;

      var _iterator = _createForOfIteratorHelper(relatedExpressions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _step.value,
              parent = _step$value.parent,
              node = _step$value.node;
          this.replacements.push({
            parent: parent,
            node: node,
            replacements: []
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.constructor.setSuperClass(superClass);
    }
    /**
     * Adds node which should be removed during transformation
     * @param {Node} parent node
     * @param {Node} node to remove
     */

  }, {
    key: "addSuperCall",
    value: function addSuperCall(parent, node, args) {
      this.superCall = node;
      this.superCallArgs = args;
      this.replacements.push({
        parent: parent,
        node: node,
        replacements: []
      });
    }
    /**
     * Adds method to class.
     * @param {PotentialMethod} method
     */

  }, {
    key: "addMethod",
    value: function addMethod(method) {
      this.methods.push(method);
    }
    /**
     * Adds field to class.
     * @param {PotentialField} field
     */

  }, {
    key: "addField",
    value: function addField(field) {
      this.fields.push(field);
    }
    /**
     * True when class has at least one method or field (besides constructor).
     * @return {Boolean}
     */

  }, {
    key: "isTransformable",
    value: function isTransformable() {
      return this.methods.length > 0 || this.fields.length > 0 || this.superClass !== undefined;
    }
    /**
     * Replaces original constructor function and manual prototype assignments
     * with ClassDeclaration.
     */

  }, {
    key: "transform",
    value: function transform(getContext) {
      var parentContext = this.parent && getContext(this.parent);
      var call = this.parent && parentContext.possibleAnonymousClassConstructionFunctionCallNode;
      var callContext = call && getContext(call);
      var match = this.parent && (0, _matchAnonymousClassConstructionFunction["default"])(this.fullNode.id)(call);

      if (call && match) {
        this.name = match.className;

        if (match.superClassNode) {
          this.superClass = match.superClassNode;
        }
      }

      this.methods.forEach(function (method) {
        return method.remove();
      });
      this.fields.forEach(function (field) {
        return field.remove();
      });
      (0, _multiReplaceStatement["default"])({
        parent: call && callContext.parent || this.parent,
        node: call || this.fullNode,
        replacements: [this.toClassDeclaration()]
      });
      this.replacements.forEach(_multiReplaceStatement["default"]);
    }
  }, {
    key: "toClassDeclaration",
    value: function toClassDeclaration() {
      return {
        type: 'ClassDeclaration',
        superClass: this.superClass,
        id: {
          type: 'Identifier',
          name: this.name
        },
        body: {
          type: 'ClassBody',
          body: this.createFieldsAndMethods()
        },
        comments: (0, _extractComments["default"])(this.commentNodes)
      };
    }
  }, {
    key: "createFieldsAndMethods",
    value: function createFieldsAndMethods() {
      var _this = this;

      return (0, _fp.compact)([].concat(_toConsumableArray(this.fields.map(function (field) {
        return field.toClassProperty();
      })), [this.createConstructor()], _toConsumableArray(this.methods.map(function (method) {
        method.setSuperClass(_this.superClass);
        return method.toMethodDefinition();
      }))));
    }
  }, {
    key: "createConstructor",
    value: function createConstructor() {
      return this.constructor.isEmpty() ? undefined : this.constructor.toMethodDefinition();
    }
  }]);

  return PotentialClass;
}();

exports["default"] = PotentialClass;