import warning from 'warning'
import { isFunction, isArray, getByPath } from './utils'
import { getModelActions } from './actions'
import prefixDispatch from './prefixDispatch'

function getState(app, path, defaultValue) {
  const state = app.store.getState()
  return path ? getByPath(state, path, defaultValue) : state
}

export function run(subscriptions, model, app, onError) {
  const history = app.history
  const dispatch = app.store.dispatch
  const innerActions = getModelActions(model, dispatch)

  const funcs = []
  const nonFuncs = []
  const listeners = []

  if (isFunction(subscriptions)) {
    listeners.push(subscriptions)
  } else if (isArray(subscriptions)) {
    listeners.push(...subscriptions)
  } else {
    Object.keys(subscriptions).forEach((key) => {
      listeners.push(subscriptions[key])
    })
  }

  listeners.forEach((sub, index) => {
    const unlistener = sub({
      history,
      getState: (path, defaultValue) => getState(app, path, defaultValue),
      // never need to call the following methods, just export for debug
      dispatch,
      innerDispatch: prefixDispatch(dispatch, model),
    }, innerActions, app.actions, onError)

    if (isFunction(unlistener)) {
      funcs.push(unlistener)
    } else {
      nonFuncs.push([model.namespace, index])
    }
  })

  return { funcs, nonFuncs }
}

export function unlisten(unlisteners, namespace) {
  if (!unlisteners[namespace]) return

  const { funcs, nonFuncs } = unlisteners[namespace]
  warning(
    nonFuncs.length === 0,
    `subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`,
  )

  funcs.forEach(unlistener => unlistener())
  delete unlisteners[namespace]
}
