import { NAMESPACE_SEP } from './constants'
import { prefixType } from './utils'

export function getModelActions(model, dispatch) {
  const { actions, namespace } = model
  return Object.keys(actions).reduce((memo, methodName) => ({
    ...memo,
    [methodName]: payload => dispatch({
      payload,
      type: prefixType(namespace, actions[methodName]),
    }),
  }), {})
}

function createActions(app, model) {
  const { actions, namespace } = model
  return Object.keys(actions).reduce((memo, methodName) => ({
    ...memo,
    // dispatch should be ready after the app started
    [methodName]: payload => app.store.dispatch({
      payload,
      type: prefixType(namespace, actions[methodName]),
    }),
  }), {})
}

export function addActions(app, model) {
  const { actions } = app
  const { namespace } = model
  const nss = namespace.split(NAMESPACE_SEP)
  let temp = actions
  nss.forEach((ns) => {
    if (!temp[ns]) {
      temp[ns] = {}
    }
    temp = temp[ns]
  })

  Object.assign(temp, createActions(app, model))

  return actions
}

export function removeActions(app, namespace) {
  const { actions } = app
  const nss = namespace.split(NAMESPACE_SEP)
  const lastIndex = nss.length - 1

  let temp = actions
  let removed = null

  nss.forEach((ns, index) => {
    if (index === lastIndex) {
      removed = temp[ns]
      delete temp[ns]
    } else if (temp) {
      temp = temp[ns]
    }
  })

  return removed
}
