import window from 'global/window'
import invariant from 'invariant'
import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga/lib/internal/middleware'
import { routerMiddleware } from 'connected-react-router'
import { flatten } from './utils'


export default function ({
  history,
  reducers,
  initialState,
  promiseMiddleware,
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
    promiseMiddleware,
    ...flatten(extraMiddlewares, true),
  ])

  if (history) {
    middlewares.push(routerMiddleware(history))
  }

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
