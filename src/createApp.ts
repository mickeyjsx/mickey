/**
 * * 主程序，createApp
 */
import { Reducer, ReducersMapObject, Middleware, StoreEnhancer } from 'redux';
import React from 'react';
import { History } from 'history';
import { Saga } from 'redux-saga';
import Plugin, { HooksConfigs, OnEffect, ReducerEnhancer, OnStateChange } from './plugin';
import getSaga from './getSaga';
import getReducer, { ReducerCreator } from './getReducer';
import createStore, { ExtendedStore, ExtraMiddlewares } from './createStore';
import createRender from './createRender';
import createModel, { ActionDispatcher, BaseRawModel, UnderlyingModel } from './createModel';
import registerModel from './registerModel';
import internalModel from './internalModel';
import createReducer from './createReducer';
import createHistory, { HistoryMode } from './createHistory';
import { removeActions } from './actions';
import createErrorHandler, { ErrorHandler } from './createErrorHandler';
import createPromiseMiddleware from './createPromiseMiddleware';
import { startWatchers, stopWatchers, UnListener } from './watcher';
import { CANCEL_EFFECTS, MICKEY_UPDATE } from './constants';
import { prefixType, fixNamespace } from './utils';

export type RecurReducer = {
  [namespace: string]: Reducer | RecurReducer;
};

export interface AppOptions<State extends {} = {}> {
  history: History;
  initialState: State;
  initialReducer: RecurReducer;
  historyMode: HistoryMode;
  hooks: HooksConfigs;
  extensions: {
    createReducer: ReducerCreator;
    combineReducers: <S = State>(rdm: ReducersMapObject<S>) => Reducer<S>;
  };
  setupMiddlewares(mds: Middleware[]): Middleware[];
}

export type RenderCallbacks = {
  beforeRender?(a: App): Promise<any> | boolean; 
  afterRender?(a: App): void;
};
export interface App {
  plugin: Plugin;
  history: History;
  actions: {
    [ns: string]: {
      [k: string]: ActionDispatcher;
    };
  };
  models: UnderlyingModel<any>[];
  has(ns: string): boolean;
  model<S extends {} = {}>(m: BaseRawModel<S>): App;
  eject(ns: string): App;
  load(): never;
  render(cpt: React.ReactNode, ct: Element, cb: RenderCallbacks): App;
  store: ExtendedStore;
}

export default function createApp(options: AppOptions): App {
  const {
    hooks = {},
    historyMode,
    initialState = {},
    initialReducer = {},
    extensions = { createReducer: undefined, combineReducers: undefined },
  } = options;

  // supportted extensions
  const { createReducer: reducerCreator, combineReducers } = extensions;
  // use `options.history` or create one with `historyMode`
  const history: History = options.history || createHistory(historyMode);

  const app: App = {} as App;
  const plugin: Plugin = (new Plugin()).use(hooks); // * 创建 plugin，即 hooks，是一个对象实例，有 hook 属性，use, apply, get 方法
  const regModel = <M extends {} = {}>(m: BaseRawModel<M>) => (registerModel(app, m)); // * 此方法可以传入一个 model，将格式化后的 model 推进 app.models 里，model 的 actions 放到 app.actions 里合适的位置

  return Object.assign(app, {
    plugin,
    history,
    actions: {},
    models: [createModel({ ...internalModel })],

    // check the namespace available or not
    has(namespace: string) {
      namespace = fixNamespace(namespace);
      return app.models.some(m => m.namespace === namespace);
    },

    // register model before app is started
    model<S extends {} = {}>(raw: BaseRawModel<S>) {
      regModel(raw);
      return app;
    },

    eject(namespace: string) {
      namespace = fixNamespace(namespace) // eslint-disable-line
      app.models = app.models.filter(m => m.namespace !== namespace)
      removeActions(app, namespace) // ? 这样是否只移除了 action，之前这些 action 对应的 reducers 和 sagas 还在

      return app
    },

    load() {
      throw new Error('The method `load(pattern)` is unavailable. This method depend on `babel-plugin-mickey-model-loader`. For more information, see: https://github.com/mickeyjsx/babel-plugin-mickey-model-loader')
    },

    // * create store, steup reducer, start the app
    render(component: React.ReactNode, container: Element | string, callback: RenderCallbacks) {
      const onError: ErrorHandler = createErrorHandler(app);
      const onEffect: OnEffect[] = plugin.get('onEffect') as OnEffect[];
      const extraReducers: ReducersMapObject = plugin.get('extraReducers') as ReducersMapObject;
      const reducerEnhancer: ReducerEnhancer = plugin.get('onReducer') as ReducerEnhancer;

      const sagas: Saga[] = [];
      const reducers: RecurReducer = { ...initialReducer };

      const innerGetSaga = <S extends {} = {}>(m: UnderlyingModel<S>): Saga => getSaga(onError, onEffect, app, m); // * 传入 model，得到 model 对应的 saga，saga 内部已经封装了 wather 和 worker，调用后的返回值可以直接被 sagaMiddleware.run()
      const innerGetReducer = <S extends {} = {}>(m: UnderlyingModel<S>) => getReducer(reducerCreator, m); // * 传入 model，得到 model 对应的 reducer
      const innerCreateReducer = (asyncReducers?: RecurReducer ): Reducer => createReducer({
        reducers,
        asyncReducers,
        extraReducers,
        reducerEnhancer,
        combineReducers,
        history: app.history,
      });

      // handle reducers and sagas in model
      app.models.forEach((model) => {
        reducers[model.namespace] = innerGetReducer(model); // * 将 model 的 reducers 在 app 的 reducers 中进行注册
        sagas.push(innerGetSaga(model)); // * 将 model 的 saga 在 app 的 sagas 里注册
      });

      // create store
      const store = app.store = createStore({
        plugin,
        options,
        initialState,
        history: app.history,
        reducers: innerCreateReducer(),
        promiseMiddleware: createPromiseMiddleware(app) as any,
        extraMiddlewares: plugin.get('onAction') as ExtraMiddlewares,
        onStateChange: plugin.get('onStateChange') as OnStateChange[],
        extraEnhancers: plugin.get('extraEnhancers') as StoreEnhancer[],
      });

      // * run sagas
      sagas.forEach(store.runSaga);

      const render = createRender(app, component, container, callback);
      render(component, container, callback);

      // * run watcher after render
      const unlisteners: { [k: string]: UnListener } = {};
      app.models.forEach((model) => {
        unlisteners[model.namespace] = startWatchers(model, app, onError);
      });

      // * replace and inject some methods after the app started
      return Object.assign(app, {
        // after the first call fo render, the render function
        // should only do pure-render with any other actions
        render,
        onError, // ? app.onError() 方法，未在文档中体现出来，目前不清楚作用

        model<S extends {} = {}>(raw: BaseRawModel<S>) {
          const namespace: string = fixNamespace(raw.namespace);

          // clean the old one when exists
          if (app.has(namespace)) {
            stopWatchers(unlisteners, namespace);
            removeActions(app, namespace);
            app.models = app.models.filter(m => m.namespace !== namespace);
            store.dispatch({ type: prefixType(namespace, CANCEL_EFFECTS) });
            store.dispatch({ type: MICKEY_UPDATE });
          }

          const model = regModel(raw);

          store.asyncReducers[namespace] = innerGetReducer(model);
          store.replaceReducer(innerCreateReducer(store.asyncReducers));
          store.runSaga(innerGetSaga(model));

          unlisteners[namespace] = startWatchers(model, app, onError);

          return app;
        },

        eject(namespace: string) {
          namespace = fixNamespace(namespace); // eslint-disable-line
          delete store.asyncReducers[namespace];
          delete reducers[namespace];

          // The pattern we recommend is to keep the old reducers around, so there's a warning
          // ref: https://stackoverflow.com/questions/34095804/replacereducer-causing-unexpected-key-error
          store.replaceReducer(innerCreateReducer(store.asyncReducers));
          store.dispatch({ type: MICKEY_UPDATE });
          store.dispatch({ type: prefixType(namespace, CANCEL_EFFECTS) });

          stopWatchers(unlisteners, namespace);

          app.models = app.models.filter(m => m.namespace !== namespace);
          removeActions(app, namespace);

          return app;
        },
      });
    },
  })
}
