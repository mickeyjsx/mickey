import window from 'global/window'
import invariant from 'invariant'
import createSagaMiddleware from 'redux-saga/lib/internal/middleware'
import { createStore, applyMiddleware, compose } from 'redux'
import { flatten } from './utils'


export default function ({
  reducers,
  initialState,
  extraMiddlewares,
  extraEnhancers,
  onStateChange,
  options: {
    setupMiddlewares = f => f,
  },
}) {
  invariant(
    Array.isArray(extraEnhancers),
    `createStore: extraEnhancers should be array, but got ${typeof extraEnhancers}`,
  )

  const sagaMiddleware = createSagaMiddleware()
  const middlewares = setupMiddlewares([
    sagaMiddleware,
    ...flatten(extraMiddlewares, true),
  ])

  const devtools = process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? window.devToolsExtension()
    : f => f

  const enhancers = [
    applyMiddleware(...middlewares),
    ...extraEnhancers,
    devtools,
  ]

  const store = createStore(reducers, initialState, compose(...enhancers))

  // extend store
  store.runSaga = sagaMiddleware.run
  store.asyncReducers = {}

  // execute listeners when state is changed
  onStateChange.forEach((listener) => {
    store.subscribe(() => {
      listener(store.getState())
    })
  })

  return store
}
