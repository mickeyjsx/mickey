import React from 'react'
import warning from 'warning'
import ReactDOM from 'react-dom'
import Plugin from './Plugin'
import Provider from './Provider'
import createModel from './createModel'
import attachHooks from './attachHooks'
import registerModel from './registerModel'
import internalModel from './internalModel'
import getSaga from './getSaga'
import getReducer from './getReducer'
import createStore from './createStore'
import createReducer from './createReducer'
import createHistory from './createHistory'
import actions, { removeActions } from './actions'
import createErrorHandler from './createErrorHandler'
import createPromiseMiddleware from './createPromiseMiddleware'
import { run as runSubscription, unlisten as unlistenSubscription } from './subscription'


export default function createApp(options = {}) {
  const {
    hooks = {},
    historyMode,
    initialState = {},
    initialReducer,
    reducerCreator,
  } = options

  // history and hooks
  const history = createHistory(historyMode)
  attachHooks(history, hooks)

  const app = {}
  const plugin = (new Plugin()).use(hooks)
  const innerRegModel = m => (registerModel(app, m))

  return Object.assign(app, {
    plugin,
    history,
    actions,
    models: [createModel({ ...internalModel })],
    hook(hook) { plugin.use(hook); return app },
    model(raw) { innerRegModel(raw); return app }, // register model before app is started
    render(component, container, callback) {
      const {
        middleware: promiseMiddleware,
        resolve,
        reject,
      } = createPromiseMiddleware(app)

      const onError = createErrorHandler(app)
      const onEffect = plugin.get('onEffect')
      const extraReducers = plugin.get('extraReducers')
      const reducerEnhancer = plugin.get('onReducer')

      const sagas = []
      const reducers = { ...initialReducer }

      const innerGetSaga = m => getSaga(resolve, reject, onError, onEffect, app, m)
      const innerGetReducer = m => getReducer(reducerCreator, m)
      const innerCreateReducer = asyncReducers => createReducer({
        reducers,
        asyncReducers,
        extraReducers,
        reducerEnhancer,
      })

      // combine reducers and run sagas
      app.models.forEach((model) => {
        reducers[model.namespace] = innerGetReducer(model)
        sagas.push(innerGetSaga(model))
      })

      // create store
      const store = app.store = createStore({ // eslint-disable-line
        initialState,
        reducers: innerCreateReducer(),
        plugin,
        promiseMiddleware,
        extraMiddlewares: plugin.get('onAction'),
        onStateChange: plugin.get('onStateChange'),
        extraEnhancers: plugin.get('extraEnhancers'),
        options,
      })

      // run sagas
      sagas.forEach(store.runSaga)

      const render = (_component, _container, _callback) => {
        const comp = _component || component
        const wrap = _container || container
        const canRender = comp && wrap

        if (canRender) {
          ReactDOM.render(<Provider app={app}>{comp}</Provider>, wrap); // eslint-disable-line
        }

        if (_callback) {
          _callback(app)
        }
      }

      render(component, container, callback)

      // run subscriptions
      const unlisteners = {}
      app.models.forEach((model) => {
        if (model.subscriptions) {
          unlisteners[model.namespace] = runSubscription(model.subscriptions, model, app, onError)
        }
      })

      // replace and inject some methods after the app started
      return Object.assign(app, {
        render,
        hook() {
          warning(
            process.env.NODE_ENV === 'production',
            'hook(): all hooks should be installed before call app.start',
          )

          return app
        },
        // inject model after app is started
        model(raw) {
          const model = innerRegModel(raw)
          const { namespace, subscriptions } = model

          store.asyncReducers[namespace] = innerGetReducer(model)
          store.replaceReducer(innerCreateReducer(store.asyncReducers))
          store.runSaga(innerGetSaga(model))

          if (model.subscriptions) {
            unlisteners[namespace] = runSubscription(subscriptions, model, app, onError)
          }

          return app
        },
        unmodel(namespace) {
          delete store.asyncReducers[namespace]
          delete reducers[namespace]

          store.replaceReducer(innerCreateReducer(store.asyncReducers))
          store.dispatch({ type: '@@internal/UPDATE' })
          store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` })

          unlistenSubscription(unlisteners, namespace)
          app.models = app.models.filter(m => m.namespace !== namespace)
          removeActions(namespace)

          return app
        },
      })
    },
  })
}
