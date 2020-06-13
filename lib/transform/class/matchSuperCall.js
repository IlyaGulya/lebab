"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fMatches = require("f-matches");

/**
 * Matches: <superConstructorFun>.call(<constructorArguments (must contain this as first argument)>) || this;
 *
 * When node matches returns the extracted fields:
 *
 * - constructorArguments
 *
 * @param  {Object} node
 * @return {Object}
 */
var _default = (0, _fMatches.matches)({
  type: 'LogicalExpression',
  left: {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      property: {
        type: 'Identifier',
        name: 'call'
      }
    },
    arguments: (0, _fMatches.extract)('constructorArguments', [{
      type: 'ThisExpression'
    }])
  },
  right: {
    type: 'ThisExpression'
  }
});

exports["default"] = _default;