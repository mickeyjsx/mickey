import warning from 'warning';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import Plugin from './Plugin';
import createErrorHandler from './createErrorHandler';
import createPromiseMiddleware from './createPromiseMiddleware';
import checkModel from './checkModel';
import createModel from './createModel';
import internalModel from './internalModel';
import getSaga from './getSaga';
import getReducer from './getReducer';
import createReducer from './createReducer';
import createStore from './createStore';
import createHistory from './createHistory';
import { addAction, removeAction } from './processAction';
import {
  run as runSubscription,
  unlisten as unlistenSubscription,
} from './subscription';
import Provider from './Provider';


export default function createApp(options = {}) {
  const {
    hooks = {},
    historyModel,
    initialState = {},
    initialReducer,
    reducerCreator,
  } = options;

  const history = createHistory(historyModel);
  if (history) {
    const routeMiddleware = routerMiddleware(history);
    if (!hooks.onAction) {
      hooks.onAction = [routeMiddleware];
    } else {
      hooks.onAction.push(routeMiddleware);
    }

    const extraReducer = { router: routerReducer };
    if (!hooks.extraReducers) {
      hooks.extraReducers = [extraReducer];
    } else {
      hooks.extraReducers.push(extraReducer);
    }
  }

  // app instance
  const app = {};
  // plugin instance
  const plugin = (new Plugin()).use(hooks);
  const registerModel = (raw) => {
    const model = createModel(raw);
    if (process.env.NODE_ENV !== 'production') {
      checkModel(model, app.models);
    }
    app.models.push(model);
    addAction(app, model);
    return model;
  };

  return Object.assign(app, {
    plugin,
    actions: {},
    history: createHistory(historyModel),
    models: [createModel({ ...internalModel })],
    hook(hook) {
      plugin.use(hook);
      return app;
    },
    // register model before app is started
    model(raw) {
      registerModel(raw);
      return app;
    },
    // start the app
    render(component, container, callback) {
      const {
        middleware: promiseMiddleware,
        resolve,
        reject,
      } = createPromiseMiddleware(app);

      const onError = createErrorHandler(app);
      const onEffect = plugin.get('onEffect');
      const extraReducers = plugin.get('extraReducers');
      const reducerEnhancer = plugin.get('onReducer');

      const sagas = [];
      const reducers = { ...initialReducer };

      const innerGetSaga = m => getSaga(resolve, reject, onError, onEffect, m);
      const innerGetReducer = m => getReducer(reducerCreator, m);
      const innerCreateReducer = asyncReducers => createReducer({
        reducers,
        asyncReducers,
        extraReducers,
        reducerEnhancer,
      });

      // combine reducers and run sagas
      app.models.forEach((model) => {
        reducers[model.namespace] = innerGetReducer(model);
        sagas.push(innerGetSaga(model));
      });

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
      });

      // run sagas
      sagas.forEach(store.runSaga);

      const render = (_component, _container, _callback) => {
        const comp = _component || component;
        const wrap = _container || container;
        const canRender = comp && wrap;

        if (canRender) {
          const ReactDOM = require('react-dom'); // eslint-disable-line
          ReactDOM.render(<Provider app={app}>{comp}</Provider>, wrap); // eslint-disable-line
        }

        if (_callback) {
          _callback(app);
        }
      };

      render(component, container, callback);

      // run subscriptions
      const unlisteners = {};
      app.models.forEach((model) => {
        if (model.subscriptions) {
          unlisteners[model.namespace] = runSubscription(model.subscriptions, model, app, onError);
        }
      });

      // replace and inject some methods after the app started
      return Object.assign(app, {
        render,
        hook() {
          warning(
            process.env.NODE_ENV === 'production',
            'app.use: all plugins should be installed before call app.start',
          );

          return app;
        },
        // inject model after app is started
        model(raw) {
          const model = registerModel(raw);
          const { namespace, subscriptions } = model;

          store.asyncReducers[namespace] = innerGetReducer(model);
          store.replaceReducer(innerCreateReducer(store.asyncReducers));
          store.runSaga(innerGetSaga(model));

          if (model.subscriptions) {
            unlisteners[namespace] = runSubscription(subscriptions, model, app, onError);
          }

          return app;
        },
        unmodel(namespace) {
          delete store.asyncReducers[namespace];
          delete reducers[namespace];

          store.replaceReducer(innerCreateReducer(store.asyncReducers));
          store.dispatch({ type: '@@internal/UPDATE' });
          store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

          unlistenSubscription(unlisteners, namespace);
          const model = app.models.find(m => m.namespace === namespace);
          app.models = app.models.filter(m => m.namespace !== namespace);

          if (model) {
            removeAction(app, model);
          }

          return app;
        },
      });
    },
  });
}
