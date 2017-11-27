import warning from 'warning'
import { isFunction, getByPath } from './utils'
import { getModelActions } from './actions'
import prefixDispatch from './prefixDispatch'

function getState(app, path, defaultValue) {
  const state = app.store.getState()
  return path ? getByPath(state, path, defaultValue) : state
}

export function startWatchers(model, app, onError) {
  const history = app.history
  const dispatch = app.store.dispatch
  const innerActions = getModelActions(model, dispatch)

  const funcs = []
  const nonFuncs = []

  if (model.watchers) {
    model.watchers.forEach((watcher, index) => {
      const unlistener = watcher({
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
  }

  return { funcs, nonFuncs }
}

export function stopWatchers(unlisteners, namespace) {
  if (!unlisteners[namespace]) return

  const { funcs, nonFuncs } = unlisteners[namespace]
  warning(
    nonFuncs.length === 0,
    `watcher should return unlistener function, check watchers in these models: ${nonFuncs.map(item => item[0]).join(', ')}`,
  )

  funcs.forEach(unlistener => unlistener())
  delete unlisteners[namespace]
}
