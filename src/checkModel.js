import invariant from 'invariant'
import { isPlainObject, isAllFunction } from './utils'


export default function checkModel(model, existModels) {
  const {
    namespace,
    reducers,
    effects,
    subscriptions,
  } = model

  invariant(
    namespace,
    'app.model: namespace should be defined',
  )

  invariant(
    typeof namespace === 'string',
    `app.model: namespace should be string, but got ${typeof namespace}`,
  )

  invariant(
    !existModels.some(m => m.namespace === namespace),
    'app.model: namespace should be unique',
  )

  if (reducers) {
    invariant(
      isPlainObject(reducers),
      `app.model: reducers should be plain object, but got ${typeof reducers}`,
    )
  }

  if (effects) {
    invariant(
      isPlainObject(effects),
      `app.model: effects should be plain object, but got ${typeof effects}`,
    )
  }

  if (subscriptions) {
    invariant(
      isPlainObject(subscriptions),
      `app.model: subscriptions should be plain object, but got ${typeof subscriptions}`,
    )

    invariant(
      isAllFunction(subscriptions),
      'app.model: subscription should be function',
    )
  }
}

