import {extract, extractAny, matches} from 'f-matches';

/**
 * Matches: return <actualConstructor>;
 *
 * When node matches returns the extracted fields:
 *
 * @param  {Object} node
 * @return {Object}
 */
export default matches({
  type: 'VariableDeclaration',
  declarations: [
    {
      type: 'VariableDeclarator',
      id: extractAny('actualConstructor'),
      init: {
        type: 'LogicalExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            property: {
              type: 'Identifier',
              name: 'call',
            },
          },
          arguments: extract(
            'constructorArguments',
            [
              {
                type: 'ThisExpression'
              }
            ]
          ),
        },
        right: {
          type: 'ThisExpression'
        },
      }
    }
  ]
});
