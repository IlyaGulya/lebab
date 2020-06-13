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
    right: (0, _fMatches.extract)('fieldNode', {
      type: 'Literal'
    })
  }
});

exports["default"] = _default;