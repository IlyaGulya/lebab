"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fMatches = require("f-matches");

/**
 * Matches: return <actualConstructor>;
 *
 * When node matches returns the extracted fields:
 *
 * @param  {Object} node
 * @return {Object}
 */
var _default = (0, _fMatches.matches)({
  type: 'VariableDeclaration',
  declarations: [{
    type: 'VariableDeclarator',
    id: (0, _fMatches.extractAny)('actualConstructor'),
    init: {
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
    }
  }]
});

exports["default"] = _default;