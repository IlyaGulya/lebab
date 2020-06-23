"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fMatches = require("f-matches");

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
var matchLiteral = (0, _fMatches.matches)({
  type: 'Literal'
});
var matchObject = (0, _fMatches.matches)({
  type: 'ObjectExpression'
});
var matchArray = (0, _fMatches.matches)({
  type: 'ArrayExpression'
});
var matchNew = (0, _fMatches.matches)({
  type: 'NewExpression'
});
var matchCall = (0, _fMatches.matches)({
  type: 'CallExpression'
});

var _default = (0, _fMatches.matches)({
  type: 'ExpressionStatement',
  expression: {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      computed: false,
      object: (0, _fMatches.extractAny)('classIdentifier'),
      property: (0, _fMatches.extractAny)('fieldIdentifier')
    },
    operator: '=',
    right: (0, _fMatches.extract)('fieldNode', function (node) {
      return matchLiteral(node) || matchObject(node) || matchArray(node) || matchNew(node) || matchCall(node);
    })
  }
});

exports["default"] = _default;