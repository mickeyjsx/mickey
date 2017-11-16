import { NAMESPACE_SEP } from './constants'

export default function createPromiseMiddleware(app) {
  const caches = {}

  function isEffect(type) {
    const cache = caches[type]
    if (cache) {
      return cache === 1
    }

    const parts = type.split(NAMESPACE_SEP)
    const namespace = parts.slice(0, -1).join(NAMESPACE_SEP)

    const ret = app.models.some((m) => {
      if (m.namespace === namespace && m.effects[type]) {
        return true
      }
      return false
    })

    caches[type] = ret ? 1 : 2

    return ret
  }

  const middleware = () => next => (action) => {
    const { type } = action
    if (isEffect(type)) {
      // action should be a plain-object
      action.resolver = {}
      const promise = new Promise((resolve, reject) => {
        action.resolver.resolve = resolve
        action.resolver.reject = reject
      })

      action.then = promise.then.bind(promise)
      action.catch = promise.catch.bind(promise)

      return next(action)
    }

    return next(action)
  }

  return middleware
}
