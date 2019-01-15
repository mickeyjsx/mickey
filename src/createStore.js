import invariant from 'invariant'
import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga/lib/internal/middleware'
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

  const composeEnhancers = process.env.NODE_ENV !== 'production'
    ? composeWithDevTools()
    : compose

  const enhancers = [
    applyMiddleware(...middlewares),
    ...extraEnhancers,
  ]

  const store = createStore(reducers, initialState, composeEnhancers(...enhancers))

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
