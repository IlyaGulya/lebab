"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _multiReplaceStatement = _interopRequireDefault(require("./../../utils/multiReplaceStatement"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Represents a potential class field to be created.
 */
var PotentialField = /*#__PURE__*/function () {
  /**
   * @param {Object} cfg
   *   @param {String} cfg.name Field name
   *   @param {Object} cfg.valueNode
   *   @param {Object} cfg.fullNode Node to remove after converting to class
   *   @param {Object[]} cfg.commentNodes Nodes to extract comments from
   *   @param {Object} cfg.parent
   *   @param {Boolean} cfg.static True to make static method (optional)
   */
  function PotentialField(cfg) {
    _classCallCheck(this, PotentialField);

    this.name = cfg.name;
    this.valueNode = cfg.valueNode;
    this.fullNode = cfg.fullNode;
    this.parent = cfg.parent;
    this["static"] = cfg["static"] || false;
  }
  /**
   * Transforms the potential field to actual ClassProperty node.
   * @return {ClassProperty}
   */


  _createClass(PotentialField, [{
    key: "toClassProperty",
    value: function toClassProperty() {
      return {
        type: 'ClassProperty',
        key: {
          type: 'Identifier',
          name: this.name
        },
        computed: false,
        value: this.valueNode,
        "static": this["static"]
      };
    }
    /**
     * Removes original prototype assignment node from AST.
     */

  }, {
    key: "remove",
    value: function remove() {
      (0, _multiReplaceStatement["default"])({
        parent: this.parent,
        node: this.fullNode,
        replacements: []
      });
    }
  }]);

  return PotentialField;
}();

exports["default"] = PotentialField;