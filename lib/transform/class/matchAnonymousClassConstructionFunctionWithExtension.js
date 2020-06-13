"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fMatches = require("f-matches");

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Matches: const <className> = function() { // DECLARATION // }()
 *
 * When node matches returns the extracted fields:
 *
 * - className
 *
 * @param  {Object} node
 * @return {Object}
 */
var _default = function _default(returnIdentifier) {
  var bodyMatcher = (0, _fMatches.matches)({
    type: 'ReturnStatement',
    argument: {
      type: 'Identifier',
      name: returnIdentifier && returnIdentifier.name
    }
  });
  var callee = returnIdentifier ? {
    type: 'FunctionExpression',
    body: {
      type: 'BlockStatement',
      body: function body(statements) {
        return _.some(statements, bodyMatcher);
      }
    }
  } : {
    type: 'FunctionExpression'
  };
  return (0, _fMatches.matches)({
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: (0, _fMatches.extractAny)('className')
      },
      init: {
        type: 'CallExpression',
        callee: callee
      }
    }]
  });
};

exports["default"] = _default;