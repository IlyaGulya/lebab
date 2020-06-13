import {extractAny, matches} from 'f-matches';
import * as _ from 'lodash';

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
export default (function(returnIdentifier) {
  const bodyMatcher = matches({
    type: 'ReturnStatement',
    argument: {
      type: 'Identifier',
      name: returnIdentifier && returnIdentifier.name,
    },
  });
  const callee = returnIdentifier ? {
    type: 'FunctionExpression',
    body: {
      type: 'BlockStatement',
      body: (statements) => _.some(statements, bodyMatcher),
    }
  } : {
    type: 'FunctionExpression'
  };
  return matches({
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: extractAny('className')
      },
      init: {
        type: 'CallExpression',
        callee: callee,
        arguments: [
          extractAny('superClassNode')
        ]
      },
    }]
  });
});
