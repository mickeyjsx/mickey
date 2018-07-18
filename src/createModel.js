/* eslint-disable no-underscore-dangle */
import invariant from 'invariant'
import baseModel from './baseModel'
import { MUTATE } from './constants'
import {
  ucfirst,
  prefixType,
  prefixObject,
  isArray,
  isFunction,
  isGeneratorFn,
  fixNamespace,
} from './utils'


function isEffect(method) {
  // if a method is generator function then it should be an effect.
  return isGeneratorFn(method)
    || (isArray(method) && isGeneratorFn(method[0])) // [ *effect(){}, type ]
}

function createEmptyGroup(type) {
  return {
    type,
    actions: {},
    effects: {},
    reducers: {},
    callbacks: [],
    effectCount: 0,
  }
}

function fillGroup(group, type, method, callback) {
  const { actions, effects, reducers, callbacks } = group
  if (typeof method === 'object' && !isArray(method)) {
    return false
  }

  if (isEffect(method)) {
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
  const keys = Object.keys(raw)
  const groups = keys.map((type) => {
    const section = raw[type]
    const group = createEmptyGroup(type)

    if (!fillGroup(group, type, section)) {
      Object.keys(section).forEach(name => fillGroup(group, type, section[name], name))
    }

    if (process.env.NODE_ENV !== 'production') {
      invariant(
        group.effectCount <= 1,
        `Less than one effect function should be specified in model "${namespace}" with action name "${type}".`,
      )
    }

    return group
  })

  if (process.env.NODE_ENV !== 'production') {
    const exist = keys.some(key => (key === MUTATE))
    invariant(
      !exist,
      `The \`mutate\` is a reserved action for mutate the state. You should change \`mutate\` to other action names in model "${namespace}".`,
    )
  }

  // extend model with `mutate` reducer
  groups.push({
    type: MUTATE,
    actions: { [MUTATE]: MUTATE },
    effects: {},
    reducers: { [MUTATE]: baseModel[MUTATE] },
    callbacks: [],
    effectCount: 0,
  })

  return groups
}

function parseWatcher(watcher) {
  if (watcher) {
    const watchers = isArray(watcher) // eslint-disable-line
      ? [...watcher] : isFunction(watcher)
        ? [watcher]
        : Object.keys(watcher).map(key => watcher[key])

    return watchers.filter(fn => isFunction(fn))
  }

  return null
}

function getWatchers(m) {
  const { watcher, subscriptions } = m
  return parseWatcher(watcher) || parseWatcher(subscriptions) || []
}

export default function createModel(m) {
  const {
    namespace,
    state,
    effects,
    reducers,
    enhancers,
    createReducer,
    ...others
  } = m

  const actions = {}
  const _effects = {}
  const _reducers = {}
  const _callbacks = {}

  if (effects) {
    Object.keys(effects).forEach((type) => {
      const method = effects[type]
      if (isEffect(method)) {
        _effects[type] = method
        actions[type] = type
      }
    })
  }

  if (reducers) {
    Object.keys(reducers).forEach((type) => {
      const method = reducers[type]
      if (isFunction(method)) {
        _reducers[type] = method
        actions[type] = type
      }
    })
  }

  const groups = parseGroups(others, namespace)
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
    createReducer,
    actions,
    effects: prefixObject(ns, _effects),
    reducers: prefixObject(ns, _reducers),
    callbacks: prefixObject(ns, _callbacks),
    watchers: getWatchers(m),
  }
}
