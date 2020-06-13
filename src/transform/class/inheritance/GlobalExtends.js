import {matches, extractAny} from 'f-matches';
import RequireUtilDetector from './RequireUtilDetector';
import RequireUtilInheritsDetector from './RequireUtilInheritsDetector';
import ImportUtilDetector from './ImportUtilDetector';
import ExtendsGlobalDetector from './ExtendsGlobalDetector';
import matchAnonymousClassConstructionFunction from '../matchAnonymousClassConstructionFunction';

/**
 * Processes nodes to detect super classes and return information for later
 * transformation.
 *
 * Detects:
 *
 *   var util = require('util');
 *   ...
 *   util.inherits(Class1, Class2);
 */
export default class GlobalExtends {
  constructor() {
    this.extendsGlobalNode = undefined;
    this.detectors = [
      new ExtendsGlobalDetector()
    ];
  }

  /**
   * Process a node and return inheritance details if found.
   * @param {Object} node
   * @param {Object} parent
   * @returns {Object/undefined} m
   *                    {String}   m.className
   *                    {Node}     m.superClass
   *                    {Object[]} m.relatedExpressions
   */
  process(node, parent) {
    let m;
    if (parent && parent.type === 'Program' && (m = this.detectExtendsGlobalNode(node))) {
      this.extendsGlobalNode = m;
    }
    else if (this.extendsGlobalNode && (m = this.matchExtendsGlobal(node))) {
      return {
        className: m.className,
        superClass: m.superClass,
        relatedExpressions: [{node, parent}]
      };
    }
  }

  detectExtendsGlobalNode(node) {
    for (const detector of this.detectors) {
      let inheritsNode;
      if ((inheritsNode = detector.detect(node))) {
        return inheritsNode;
      }
    }
  }

  // Discover usage of this.extendsGlobalNode
  //
  // Matches: __extends(<className>, <superClass>);
  matchExtendsGlobal(node) {
    return matches({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: this.extendsGlobalNode,
        arguments: [
          {
            type: 'Identifier',
            name: extractAny('className')
          },
          extractAny('superClass')
        ]
      }
    }, node);
  }
}
