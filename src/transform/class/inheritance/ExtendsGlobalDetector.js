import {find} from 'lodash/fp';
import {matches} from 'f-matches';

/**
 * Detects __extends global variable
 */
export default class ExtendsGlobalDetector {
  /**
   * Detects: var __extends
   *
   * @param {Object} node
   * @return {Object} Identifier of __extends
   */
  detect(node) {
    if (node.type !== 'VariableDeclaration') {
      return;
    }

    const declaration = find(dec => this.isExtendsGlobal(dec), node.declarations);
    if (declaration) {
      return {
        type: 'Identifier',
        name: '__extends',
      };
    }
  }

  // Matches: var __extends
  isExtendsGlobal(dec) {
    return matches({
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: '__extends',
      },
    }, dec);
  }
}
