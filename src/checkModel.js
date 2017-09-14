import warning from 'warning'
import invariant from 'invariant'
import { isPlainObject, isFunction, isAllFunction, isArray } from './utils'


export default function checkModel(model, existModels) {
  const {
    namespace,
    subscriptions,
  } = model

  invariant(
    namespace,
    'app.model: namespace should be specified',
  )

  invariant(
    typeof namespace === 'string',
    `app.model: namespace should be string, but got ${typeof namespace}`,
  )

  invariant(
    !existModels.some(m => m.namespace === namespace),
    'app.model: namespace should be unique',
  )

  if (subscriptions) {
    const isFn = isFunction(subscriptions)
    const isArr = isArray(subscriptions)
    const isObj = isPlainObject(subscriptions)

    if (isObj) {
      warning(false, '[deprecated] app.model: subscriptions with plain object is deprecated, function or array of functions are recommended.')
    }

    if (!isObj && !isArr && !isFn) {
      invariant(false, `app.model: subscriptions should be a function or array of functions, but got ${typeof subscriptions}`,
      )
    }

    invariant(isAllFunction(subscriptions), 'app.model: subscription should be function')
  }
}

