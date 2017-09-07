/* eslint-disable no-underscore-dangle */

import warning from 'warning'
import {
  ucfirst,
  prefixType,
  prefixObject,
  isArray,
  isFunction,
  isGeneratorFn,
  fixNamespace,
} from './utils'


function fillGroup(group, type, method, callback) {
  const { actions, effects, reducers, callbacks } = group
  if (typeof method === 'object') {
    return false
  }

  // If a method is generator function then it should be an effect.
  if (isGeneratorFn(method)
    // [ *effect(){}, type ]
    || (isArray(method) && isGeneratorFn(method[0]))
  ) {
    actions[type] = type
    effects[type] = method
    group.effectCount += 1
    return true
  } else if (isFunction(method)) {
    if (callback && callback !== 'prepare') {
      const prefixed = prefixType(type, callback) // query/succeed
      actions[type + ucfirst(callback)] = prefixed // { querySucceed: 'query/scuueed' }
      reducers[prefixed] = method
      callbacks.push(callback)
    } else {
      actions[type] = type
      reducers[type] = method
    }
    return true
  }

  return false
}

function parseGroups(raw, namespace) {
  return Object.keys(raw).map((type) => {
    const section = raw[type]
    const group = {
      type,
      actions: {},
      effects: {},
      reducers: {},
      callbacks: [],
      effectCount: 0,
    }

    if (!fillGroup(group, type, section)) {
      Object.keys(section).forEach(name => fillGroup(group, type, section[name], name))
    }

    if (process.env.NODE_ENV !== 'production') {
      warning(
        group.effectCount <= 1,
        `Less than one effect function should be specified in model "${namespace}" with action name "${type}".`,
      )
    }

    return group
  })
}

export default function createModel(m) {
  const {
    namespace,
    state,
    effects = {},
    reducers = {},
    enhancers,
    subscriptions,
    createReducer,
    ...others
  } = m

  const actions = {}
  const _effects = Object.assign({}, effects)
  const _reducers = Object.assign({}, reducers)
  const _callbacks = {}
  const groups = parseGroups(others, namespace)

  if (effects) {
    Object.keys(effects).forEach((type) => { actions[type] = type })
  }
  if (reducers) {
    Object.keys(reducers).forEach((type) => { actions[type] = type })
  }

  groups.forEach((group) => {
    Object.assign(actions, group.actions)
    Object.assign(_effects, group.effects)
    Object.assign(_reducers, group.reducers)
    if (group.callbacks.length) {
      _callbacks[group.type] = group.callbacks
    }
  })

  const ns = fixNamespace(namespace)
  return {
    namespace: ns,
    state,
    enhancers,
    subscriptions,
    createReducer,
    actions,
    effects: prefixObject(ns, _effects),
    reducers: prefixObject(ns, _reducers),
    callbacks: prefixObject(ns, _callbacks),
  }
}
