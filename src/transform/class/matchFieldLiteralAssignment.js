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
    right: extract('fieldNode', {
      type: 'Literal'
    })
  }
});
