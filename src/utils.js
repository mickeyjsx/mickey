import isFunction from 'lodash.isfunction';
import isGenerator from 'is-generator';
import { NAMESPACE_SEP } from './constants';

export flatten from 'lodash.flatten';
export isPlainObject from 'is-plain-object';
export isFunction from 'lodash.isfunction';
export const isGeneratorFn = isGenerator.fn;
export const isArray = Array.isArray.bind(Array);
export const noop = () => { };
export const ucfirst = s => s.charAt(0).toUpperCase() + s.substr(1);
export const filename = file => file.match(/([^/]+)\.js$/)[1];
export const isAllFunction = obj => Object.keys(obj).every(key => isFunction(obj[key]));

export const unfixType = (namespace, type) => (type.replace(`${namespace}${NAMESPACE_SEP}`, ''));
export const prefixType = (namespace, type) => (`${namespace}${NAMESPACE_SEP}${type}`);

export const prefixObject = (namespace, obj) => Object.keys(obj).reduce((memo, type) => {
  memo[prefixType(namespace, type)] = obj[type];
  return memo;
}, {});

export const prefixAndValidate = (type, model) => {
  const { effects, reducers, namespace } = model;

  const prefixed = prefixType(namespace, type);
  const final = prefixed.replace(/\/@@[^/]+?$/, '');
  if (reducers[final] || effects[final]) {
    return final;
  }
  return type;
};

export const getNamespace = (path) => {
  const parts = path.split('/');
  const len = parts.length;
  const ns = parts.slice(1, len - 1);

  ns.push(filename(parts[len - 1]));

  return ns.join(NAMESPACE_SEP);
};

export const getEnhancer = (enhancers) => {
  if (enhancers && enhancers.length) {
    return reducer => enhancers.reduce((memo, reducerEnhancer) => reducerEnhancer(memo), reducer);
  }
  return f => f;
};
