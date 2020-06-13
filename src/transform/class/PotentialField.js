import multiReplaceStatement from './../../utils/multiReplaceStatement';

/**
 * Represents a potential class field to be created.
 */
export default class PotentialField {
  /**
   * @param {Object} cfg
   *   @param {String} cfg.name Field name
   *   @param {Object} cfg.valueNode
   *   @param {Object} cfg.fullNode Node to remove after converting to class
   *   @param {Object[]} cfg.commentNodes Nodes to extract comments from
   *   @param {Object} cfg.parent
   *   @param {Boolean} cfg.static True to make static method (optional)
   */
  constructor(cfg) {
    this.name = cfg.name;
    this.valueNode = cfg.valueNode;
    this.fullNode = cfg.fullNode;
    this.parent = cfg.parent;
    this.static = cfg.static || false;
  }

  /**
   * Transforms the potential field to actual ClassProperty node.
   * @return {ClassProperty}
   */
  toClassProperty() {
    return {
      type: 'ClassProperty',
      key: {
        type: 'Identifier',
        name: this.name,
      },
      computed: false,
      value: this.valueNode,
      static: this.static,
    };
  }

  /**
   * Removes original prototype assignment node from AST.
   */
  remove() {
    multiReplaceStatement({
      parent: this.parent,
      node: this.fullNode,
      replacements: [],
    });
  }
}
