import invariant from 'invariant';
import { createStore, applyMiddleware, compose, Reducer, Middleware, StoreEnhancer, Store } from 'redux';
import { History } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import { flattendeep } from './utils';
import Plugin, { OnStateChange } from './plugin';
import { AppOptions } from './createApp';

// * 利用 reducers 还有各种 middleware 以及一些增强型的额外参数，创建 store，创建的 store 被扩展了 runSaga 方法 和 asyncReducers参数
export interface ExtraMiddlewares {
  length: number;
  [k: number]: Middleware | Middleware[] | ExtraMiddlewares;
}
interface CreateStoreParam<State extends {} = {}> {
  plugin: Plugin;
  history: History;
  reducers: Reducer;
  initialState: State;
  promiseMiddleware: Middleware;
  extraMiddlewares: ExtraMiddlewares;
  extraEnhancers: StoreEnhancer[];
  onStateChange: OnStateChange[];
  options: AppOptions;
}
export type ExtendedStore = {
  runSaga: SagaMiddleware['run'];
  asyncReducers: { [k: string]: Reducer };
} & Store;
export default function (param: CreateStoreParam): ExtendedStore {
  const {
    history,
    reducers,
    initialState,
    promiseMiddleware,
    extraMiddlewares,
    extraEnhancers: storeEnhancers,
    onStateChange,
    options: {
      setupMiddlewares = (f: any) => f, // TODO: 这个 API 没写在文档里
    },
  } = param;
  invariant(
    Array.isArray(storeEnhancers),
    `createStore: extraEnhancers should be array, but got ${typeof storeEnhancers}`,
  );

  const sagaMiddleware: SagaMiddleware = createSagaMiddleware();
  const middlewares: Middleware[] = setupMiddlewares([
    sagaMiddleware,
    promiseMiddleware,
    ...flattendeep(extraMiddlewares) as Middleware[],
  ]);

  if (history) {
    middlewares.push(routerMiddleware(history));
  }

  const composeEnhancers = process.env.NODE_ENV !== 'production'
    ? (storeEnhancers: StoreEnhancer[]) => composeWithDevTools(compose(...storeEnhancers))
    : (storeEnhancers: StoreEnhancer[]) => compose(...storeEnhancers);

  const enhancers: StoreEnhancer[] = [
    applyMiddleware(...middlewares),
    ...storeEnhancers,
  ];

  const store: ExtendedStore = createStore(reducers, initialState, composeEnhancers(enhancers) as StoreEnhancer) as ExtendedStore;

  // extend store
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {}; // ? 暂时不清楚用途

  // execute listeners when state is changed
  onStateChange.forEach((listener) => {
    store.subscribe(() => {
      listener(store.getState());
    });
  });

  return store;
};
