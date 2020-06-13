import {extract, matches} from 'f-matches';

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
export default matches({
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
});
