import {compact} from 'lodash/fp';
import extractComments from './extractComments';
import multiReplaceStatement from './../../utils/multiReplaceStatement';
import matchAnonymousClassConstructionFunction from './matchAnonymousClassConstructionFunction';

/**
 * Represents a potential class to be created.
 */
export default class PotentialClass {
  /**
   * @param {Object} cfg
   *   @param {String} cfg.name Class name
   *   @param {Object} cfg.fullNode Node to remove after converting to class
   *   @param {Object[]} cfg.commentNodes Nodes to extract comments from
   *   @param {Object} cfg.parent
   */
  constructor({name, fullNode, commentNodes, parent}) {
    this.name = name;
    this.constructor = undefined;
    this.fullNode = fullNode;
    this.superClass = undefined;
    this.commentNodes = commentNodes;
    this.parent = parent;
    this.methods = [];
    this.fields = [];
    this.replacements = [];
    this.superCall = undefined;
    this.superCallArgs = [];
  }

  /**
   * Returns the name of the class.
   * @return {String}
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the AST node for the original function
   * @return {Object}
   */
  getFullNode() {
    return this.fullNode;
  }

  /**
   * Set the constructor.
   * @param {PotentialMethod} method.
   */
  setConstructor(method) {
    this.constructor = method;
  }

  /**
   * Set the superClass and set up the related assignment expressions to be
   * removed during transformation.
   * @param {Node} superClass           The super class node.
   * @param {Node[]} relatedExpressions The related expressions to be removed
   *                                    during transformation.
   */
  setSuperClass(superClass, relatedExpressions) {
    this.superClass = superClass;
    for (const {parent, node} of relatedExpressions) {
      this.replacements.push({
        parent,
        node,
        replacements: []
      });
    }

    this.constructor.setSuperClass(superClass);
  }

  /**
   * Adds node which should be removed during transformation
   * @param {Node} parent node
   * @param {Node} node to remove
   */
  addSuperCall(parent, node, args) {
    this.superCall = node;
    this.superCallArgs = args;
    this.replacements.push({
      parent,
      node,
      replacements: [],
    });
  }

  /**
   * Adds method to class.
   * @param {PotentialMethod} method
   */
  addMethod(method) {
    this.methods.push(method);
  }

  /**
   * Adds field to class.
   * @param {PotentialField} field
   */
  addField(field) {
    this.fields.push(field);
  }

  /**
   * True when class has at least one method or field (besides constructor).
   * @return {Boolean}
   */
  isTransformable() {
    return this.methods.length > 0 || this.fields.length > 0 || this.superClass !== undefined;
  }

  /**
   * Replaces original constructor function and manual prototype assignments
   * with ClassDeclaration.
   */
  transform(getContext) {
    const parentContext = this.parent && getContext(this.parent);
    const call = this.parent && parentContext.possibleAnonymousClassConstructionFunctionCallNode;
    const callContext = call && getContext(call);
    const match = this.parent && matchAnonymousClassConstructionFunction(this.fullNode.id)(call);
    if (call && match) {
      this.name = match.className;
      if (match.superClassNode) {
        this.superClass = match.superClassNode;
      }
    }

    this.methods.forEach(method => method.remove());
    this.fields.forEach(field => field.remove());

    multiReplaceStatement({
      parent: (call && callContext.parent) || this.parent,
      node: call || this.fullNode,
      replacements: [this.toClassDeclaration()],
    });
    this.replacements.forEach(multiReplaceStatement);
  }

  toClassDeclaration() {
    return {
      type: 'ClassDeclaration',
      superClass: this.superClass,
      id: {
        type: 'Identifier',
        name: this.name,
      },
      body: {
        type: 'ClassBody',
        body: this.createFieldsAndMethods()
      },
      comments: extractComments(this.commentNodes),
    };
  }

  createFieldsAndMethods() {
    return compact([
      ...this.fields.map(field => {
        return field.toClassProperty();
      }),
      this.createConstructor(),
      ...this.methods.map(method => {
        method.setSuperClass(this.superClass);
        return method.toMethodDefinition();
      })
    ]);
  }

  createConstructor() {
    return this.constructor.isEmpty() ? undefined : this.constructor.toMethodDefinition();
  }
}
