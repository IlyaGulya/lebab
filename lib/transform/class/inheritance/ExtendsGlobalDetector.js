"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fp = require("lodash/fp");

var _fMatches = require("f-matches");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Detects __extends global variable
 */
var ExtendsGlobalDetector = /*#__PURE__*/function () {
  function ExtendsGlobalDetector() {
    _classCallCheck(this, ExtendsGlobalDetector);
  }

  _createClass(ExtendsGlobalDetector, [{
    key: "detect",

    /**
     * Detects: var __extends
     *
     * @param {Object} node
     * @return {Object} Identifier of __extends
     */
    value: function detect(node) {
      var _this = this;

      if (node.type !== 'VariableDeclaration') {
        return;
      }

      var declaration = (0, _fp.find)(function (dec) {
        return _this.isExtendsGlobal(dec);
      }, node.declarations);

      if (declaration) {
        return {
          type: 'Identifier',
          name: '__extends'
        };
      }
    } // Matches: var __extends

  }, {
    key: "isExtendsGlobal",
    value: function isExtendsGlobal(dec) {
      return (0, _fMatches.matches)({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: '__extends'
        }
      }, dec);
    }
  }]);

  return ExtendsGlobalDetector;
}();

exports["default"] = ExtendsGlobalDetector;