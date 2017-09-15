import isFunction from 'lodash.isfunction'
import { NAMESPACE_SEP } from './constants'

export asign from 'object-assign'
export getByPath from 'lodash.get'
export flatten from 'lodash.flatten'
export minimatch from 'minimatch'
export isPlainObject from 'is-plain-object'
export isFunction from 'lodash.isfunction'
// Test generator function that compilied with babel(babel-profill)
export const isGeneratorFn = fn => (
  typeof fn === 'function' &&
  fn.constructor &&
  (
    fn.constructor.name === 'GeneratorFunction' ||
    fn.constructor.displayName === 'GeneratorFunction'
  )
)
export const isArray = Array.isArray.bind(Array)
export const isString = str => typeof str === 'string'
export const ucfirst = s => s.charAt(0).toUpperCase() + s.substr(1)
export const filename = file => file.match(/([^/]+)\.js$/)[1]
export const isAllFunction = obj => Object.keys(obj).every(key => isFunction(obj[key]))
export const isHTMLElement = node => !!(node && typeof node === 'object' && node.nodeType && node.nodeName)

export const unfixType = (namespace, type) => (type.replace(`${namespace}${NAMESPACE_SEP}`, ''))
export const prefixType = (namespace, type) => (`${namespace}${NAMESPACE_SEP}${type}`)

export const prefixObject = (namespace, obj) => Object.keys(obj).reduce((memo, type) => {
  memo[prefixType(namespace, type)] = obj[type]
  return memo
}, {})

export const prefixAndValidate = (type, model) => {
  const { effects, reducers, namespace } = model

  const prefixed = prefixType(namespace, type)
  const final = prefixed.replace(/\/@@[^/]+?$/, '')
  if (reducers[final] || effects[final]) {
    return final
  }
  return type
}

export const getEnhancer = (enhancers) => {
  if (enhancers) {
    if (isArray(enhancers)) {
      return reducer => enhancers.reduce((memo, reducerEnhancer) => reducerEnhancer(memo), reducer)
    } else if (isFunction(enhancers)) {
      return reducer => enhancers(reducer)
    }
  }

  return f => f
}

export const getNamespaceFromPath = (path) => {
  const parts = path.split('/')
  const file = parts.pop()

  if (path[0] === '.' || path[0] === '/') {
    parts.shift()
  }

  parts.push(filename(file))

  return parts.join('.')
}

export const fixNamespace = namespace => namespace.replace(/\//g, '_').replace(/\./g, '/')
