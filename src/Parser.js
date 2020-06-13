import espree from 'espree';
import acornStaticClassFeatures from 'acorn-static-class-features';
import classFieldsPlugin from './utils/acorn/classFieldsPlugin';

const ESPREE_OPTS = {
  ecmaVersion: 9,
  ecmaFeatures: {jsx: true},
  comment: true,
  tokens: true,
  additionalAcornExtensions: [acornStaticClassFeatures, classFieldsPlugin]
};

/**
 * An Esprima-compatible parser with JSX and object rest/spread parsing enabled.
 */
export default {
  parse(js, opts) {
    return espree.parse(js, {...opts, ...ESPREE_OPTS});
  },
  tokenize(js, opts) {
    return espree.tokenize(js, {...opts, ...ESPREE_OPTS});
  },
};
