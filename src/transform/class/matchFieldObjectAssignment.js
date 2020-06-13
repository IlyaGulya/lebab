import {matches, extract, extractAny} from 'f-matches';
import isFunctionProperty from './isFunctionProperty';

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
      property: extractAny('objectIdentifier')
    },
    operator: '=',
    right: extract('objectNode', {
      type: 'ObjectExpression'
    })
  }
});
