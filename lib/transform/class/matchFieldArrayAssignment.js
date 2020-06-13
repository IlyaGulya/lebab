"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fMatches = require("f-matches");

var _isFunctionProperty = _interopRequireDefault(require("./isFunctionProperty"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Matches: <className>.<fieldName> = <value>
 *
 * When node matches returns the extracted fields:
 *
 * - className
 * - fieldName
 * - fieldNode
 *
 * @param  {Object} node
 * @return {Object}
 */
var _default = (0, _fMatches.matches)({
  type: 'ExpressionStatement',
  expression: {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      computed: false,
      object: (0, _fMatches.extractAny)('classIdentifier'),
      property: (0, _fMatches.extractAny)('arrayIdentifier')
    },
    operator: '=',
    right: (0, _fMatches.extract)('arrayNode', {
      type: 'ArrayExpression'
    })
  }
});

exports["default"] = _default;