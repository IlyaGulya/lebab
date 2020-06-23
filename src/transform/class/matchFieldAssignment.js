import {matches, extract, extractAny} from 'f-matches';

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
const matchLiteral = matches({
  type: 'Literal'
});
const matchObject = matches({
  type: 'ObjectExpression'
});
const matchArray = matches({
  type: 'ArrayExpression'
});
const matchNew = matches({
  type: 'NewExpression'
});
const matchCall = matches({
  type: 'CallExpression'
});

export default matches({
  type: 'ExpressionStatement',
  expression: {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      computed: false,
      object: extractAny('classIdentifier'),
      property: extractAny('fieldIdentifier')
    },
    operator: '=',
    right: extract('fieldNode', (node => {
      return matchLiteral(node) || matchObject(node) || matchArray(node) || matchNew(node) || matchCall(node);
    }))
  }
});
