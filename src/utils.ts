import { Reducer } from 'redux';
import _isFunction from 'lodash.isfunction';
import _asign from 'object-assign';
import _getByPath from 'lodash.get';
import _flattendeep from 'lodash.flattendeep';
import _minimatch from 'minimatch';
import _isPlainObject from 'is-plain-object';
import { ReducerEnhancer } from './plugin';
import { NAMESPACE_SEP } from './constants';
import { UnderlyingModel } from './createModel';

export const isFunction = _isFunction;
export const asign = _asign;
export const getByPath = _getByPath;
export const flattendeep = _flattendeep;
export const minimatch = _minimatch;
export const isPlainObject = _isPlainObject;

// Test generator function that compilied with typescript
export const isGeneratorFn = (fn: any) => (
  typeof fn === 'function' && fn.constructor && fn.constructor.name === 'GeneratorFunction'
);

export const isArray = Array.isArray.bind(Array);
export const isString = (str: any) => typeof str === 'string';
export const ucfirst = (s: string) => s.charAt(0).toUpperCase() + s.substr(1);
export const filename = (file: string) => {
  const result = file.match(/([^/]+)\.(js|ts)$/);
  return result ? result[1] : file;
};
export const isHTMLElement = (node: any) => !!(node && typeof node === 'object' && node.nodeType && node.nodeName);

export const unfixType = (namespace: string, type: string): string => (type.replace(`${namespace}${NAMESPACE_SEP}`, ''));
export const prefixType = (namespace: string, type: string): string => (`${namespace}${NAMESPACE_SEP}${type}`);

export const prefixObject = <T extends { [k: string]: any }>(namespace: string, obj: T): T => {
  return Object.keys(obj).reduce((memo, key) => {
    memo[prefixType(namespace, key)] = obj[key];
    return memo
  }, {} as T);
}

export const prefixAndValidate = <S extends {} = {}>(type: string, model: UnderlyingModel<S>): string => {
  const { effects, reducers, namespace } = model;

  const prefixed: string = prefixType(namespace, type);
  const final: string = prefixed.replace(/\/@@[^/]+?$/, '');
  if (reducers[final] || effects[final]) {
    return final;
  }
  return type;
};

/**
 * * 参数是增强器，包在闭包里
 * @param {Function | Function[]} enhancers
 * @returns {Function}
 * * 返回值为 reducer 的增强函数，接收 reducer，返回使用增强器增强后的 reducer
 */
export const getEnhancer = (enhancers: ReducerEnhancer[] | undefined): ReducerEnhancer => {
  if (enhancers && isArray(enhancers)) {
    return (reducer: Reducer) => enhancers.reduce((memo, reducerEnhancer) => reducerEnhancer(memo), reducer); 
  }
  return r => r;
}

export const fixNamespace = (namespace: string): string => namespace.replace(/\//g, '_').replace(/\./g, '/'); // ? 还不是很清楚这么转换 namespace 的原因
