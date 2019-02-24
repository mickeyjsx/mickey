/* eslint-disable no-underscore-dangle */
import invariant from 'invariant';
import { History } from 'history';
import { Dispatch } from 'redux';
import baseModel from './baseModel';
import { MUTATE } from './constants';
import { ReducerCreator } from './getReducer';
import { ReducerEnhancer } from './plugin';
import { fixNamespace, isArray, isFunction, isGeneratorFn, prefixObject, prefixType, ucfirst } from './utils';
import { ErrorHandler } from './createErrorHandler';
import { ActionDispatcherMap, RecurActionDispatcher } from './actions';

export type ActionDispatcher<State extends {} = {}> = (state: State, payload?: any) => State; // ?! 这不是 Reducer 吗，看下之前哪里是不是写错了

// Mickey in reducer form
export interface MickeyReducer<S extends any = {}, P extends any = any> {
  (s: S, p: P): S;
}

// Mickey generator
export interface MickeyTask {
  (...args: any): IterableIterator<any>;
}

// Mickey generator, user could set the saga helper function type in one of 'takeEvery' | 'takeLates' | 'throttle' | 'watcher'
// 'watcher' means running when every time dispatch action
export interface TakeEveryTaskType {
  type: 'takeEvery';
}
export interface TakeLatestTaskType {
  type: 'takeLatest';
}
export interface ThrottleTaskType {
  type: 'throttle';
  ms: number;
}
export interface WatchTaskType {
  type: 'watcher';
}
export type MickeyControlType = TakeEveryTaskType | TakeLatestTaskType | ThrottleTaskType | WatchTaskType;
export type MickeyControllableTask = [MickeyTask, MickeyControlType];

// Mickey generator object unit
export type MickeyUnitObject = {
  [k: string]: {
    prepare?: MickeyReducer;
    [key: string]: MickeyTask | MickeyReducer | undefined;
  }
};

// All types of Mickey
export type Mickey = MickeyReducer | MickeyTask | MickeyControllableTask | MickeyUnitObject;

// Check if a method is type of MickeyTask or MickeyControllableTask
function isEffect(method: Mickey): boolean {
  return isGeneratorFn(method)
    || (isArray(method) && isGeneratorFn(method[0]));
}

function createEmptyGroup(type: string): MickeyProduct {
  return {
    type,
    actions: {},
    effects: {},
    reducers: {},
    callbacks: [],
    effectCount: 0,
  }
}

function fillGroup(mickeyProduct: MickeyProduct, mickeyMapKey: string, mickey: Mickey, nestedKey?: string): boolean {
  const { actions, effects, reducers, callbacks } = mickeyProduct;
  if (typeof mickey === 'object' && !isArray(mickey)) {
    return false;
  }

  if (isEffect(mickey)) {
    actions[mickeyMapKey] = mickeyMapKey;
    effects[mickeyMapKey] = mickey as MickeyTask | MickeyControllableTask;
    mickeyProduct.effectCount += 1;
    return true;
  } else if (isFunction(mickey)) {
    if (nestedKey && nestedKey !== 'prepare') { // * innterType 参数存在，说明是在处理一个 object 单元的 内部
      const prefixed: string = prefixType(mickeyMapKey, nestedKey); // query/succeed
      actions[mickeyMapKey + ucfirst(nestedKey)] = prefixed; // { querySucceed: 'query/scuueed' }
      reducers[prefixed] = mickey as MickeyReducer;
      callbacks.push(nestedKey);
    } else {
      actions[mickeyMapKey] = mickeyMapKey;
      reducers[mickeyMapKey] = mickey as MickeyReducer;
    }
    return true;
  }

  return false;
}

// The out-come product after parsing a mickey(Mickey) unit
interface MickeyProduct {
  type: string;
  actions: { [k: string]: string };
  effects: { [k: string]: MickeyTask | MickeyControllableTask };
  reducers: { [k: string]: MickeyReducer }
  callbacks: string[];
  effectCount: number;
}

// Parse mickeys map return produce MickeyProduct[]
function parseMickeyMap(mickeysMap: { [k: string]: Mickey }, namespace: string): MickeyProduct[] {
  const keys = Object.keys(mickeysMap);
  const _mickeyProducts = keys.map((mickeyMapKey) => {
    const mickey: Mickey = mickeysMap[mickeyMapKey];
    const mickeyProduct: MickeyProduct = createEmptyGroup(mickeyMapKey);

    // * 拿 raw model 中的一个 section 去填充初始化的空的 group，如果不是对象，而是 saga 或者 reducer，则填充成功然后结束操作，否则就是 object，展开后用展开的 section 去填充 emptyGroup
    if (!fillGroup(mickeyProduct, mickeyMapKey, mickey)) {
      Object.keys(mickey as MickeyUnitObject).forEach(
        innerType => fillGroup(mickeyProduct, mickeyMapKey, (mickey as any)[innerType], innerType)
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      invariant(
        mickeyProduct.effectCount <= 1,
        `Less than one effect function should be specified in model "${namespace}" with action name "${mickeyMapKey}".`,
      );
    }

    return mickeyProduct;
  });

  if (process.env.NODE_ENV !== 'production') {
    const exist = keys.some(key => (key === MUTATE));
    invariant(
      !exist,
      `The \`mutate\` is a reserved action for mutate the state. You should change \`mutate\` to other action names in model "${namespace}".`, // ? 是否应该用 ${MUTATE} 而不是直接的 'mutate'
    );
  }

  // extend model with `mutate` reducer
  _mickeyProducts.push({
    type: MUTATE,
    actions: { [MUTATE]: MUTATE },
    effects: {},
    reducers: { [MUTATE]: baseModel[MUTATE] },
    callbacks: [],
    effectCount: 0,
  });

  return _mickeyProducts;
}

type WatcherOptions = {
  history: History;
  getState: (path: string, defaultValue: any) => any;
  dispatch: Dispatch; // TODO: detail
  innerDispatch: Dispatch; // TODO: detail
};
export interface Watcher {
  (
    options: WatcherOptions,
    innerActions: ActionDispatcherMap,
    actions: RecurActionDispatcher,
    onError: ErrorHandler,
  ): Function | undefined
}

function parseWatcher(watcher: undefined | Watcher | Watcher[] | { [k: string]: Watcher }): Watcher[] | null {
  if (watcher) {
    const watchers = isArray(watcher)
      ? [...watcher] : isFunction(watcher)
        ? [watcher]
        : Object.keys(watcher).map(key => (watcher as { [k: string]: Watcher })[key]);

    return (watchers as Watcher[]).filter(fn => isFunction(fn));
  }

  return null;
}

function getWatchers<S>(m: BaseRawModel<S>): Watcher[] | [] {
  const { watcher, subscriptions } = m;
  return parseWatcher(watcher) || parseWatcher(subscriptions) || [];
}

// User defined model, called raw model
export interface BaseRawModel<S extends {} = {}> {
  namespace: string;
  state: S;
  watcher?: Watcher | Watcher[] | { [k: string]: Watcher };
  subscriptions?: Watcher | Watcher[] | { [k: string]: Watcher };
  effects?: { [k: string]: MickeyTask | MickeyControllableTask };
  reducers?: { [k: string]: MickeyReducer<S> };
  enhancers?: ReducerEnhancer[];
  createReducer?: ReducerCreator;
} // TODO: 设置剩余键的类型为 Mickey

// Underneath model using by farmework, generated from baseRawModel
export interface UnderlyingModel<S> {
  namespace: string;
  state: S;
  enhancers?: ReducerEnhancer[];
  createReducer?: ReducerCreator;
  actions: { [k: string]: string };
  effects: { [k: string]: MickeyTask | MickeyControllableTask };
  reducers: { [k: string]: MickeyReducer<S> };
  callbacks: { [k: string]: string[] };
  watchers?: Watcher[];
}

export default function createModel<S>(model: BaseRawModel<S>): UnderlyingModel<S> {
  const {
    namespace,
    state,
    effects,
    reducers,
    enhancers,
    createReducer,
    ...rest
  } = model;
  const mickeysMap: { [k: string]: Mickey } = rest as any;

  const actions: { [k: string]: string } = {};
  const _effects: { [k: string]: MickeyTask | MickeyControllableTask } = {};
  const _reducers: { [k: string]: MickeyReducer<S> } = {};
  const _callbacks: { [k: string]: string[] } = {};

  // * 从 raw model 中读取 effects 属性，其值为一个对象，里面每一个 key 对应的 value 可能是一个 effect，用 isEffect 函数判断。key 为 action type，存在 actions 里；value 为 effect，按 action type 存在 _effects 里
  if (effects) {
    Object.keys(effects).forEach((mickeyTaskName) => {
      const mickeyTask = effects[mickeyTaskName];
      if (isEffect(mickeyTask)) {
        _effects[mickeyTaskName] = mickeyTask;
        actions[mickeyTaskName] = mickeyTaskName;
      }
    });
  }

  // * 从 raw model 里面读取 reducers 属性，其值为一个对象。key 为 action type，存在 actions 里；value 为 reducer，按 action type 存在 _reducers 里
  if (reducers) {
    Object.keys(reducers).forEach((mickeyReducerName) => {
      const mickeyReducer = reducers[mickeyReducerName];
      if (isFunction(mickeyReducer)) {
        _reducers[mickeyReducerName] = mickeyReducer;
        actions[mickeyReducerName] = mickeyReducerName;
      }
    });
  }

  // * 除了指定读取的属性，其它属性都作为 groups，解析这些 groups。每个 group 中都包含了对应的 actions, effects, reducers 等信息
  const mickeyProducts: MickeyProduct[] = parseMickeyMap(mickeysMap, namespace); // * group 内被添加了 callbacks 字段
  mickeyProducts.forEach((mickeyProduct: MickeyProduct) => {
    Object.assign(actions, mickeyProduct.actions); // ! 其实这里可能会存在命名覆盖的问题，另外在 group 中并没有考虑 namespace，而是在下面的代码中，最后生成 model 才加上 namespace，但是奇怪的是 actions 还是没有在这时考虑 namespace
    Object.assign(_effects, mickeyProduct.effects);
    Object.assign(_reducers, mickeyProduct.reducers);
    if (mickeyProduct.callbacks.length) {
      _callbacks[mickeyProduct.type] = mickeyProduct.callbacks;
    }
  });

  const ns: string = fixNamespace(namespace);
  return {
    namespace: ns,
    state,
    enhancers,
    createReducer,
    actions,
    effects: prefixObject(ns, _effects),
    reducers: prefixObject(ns, _reducers),
    callbacks: prefixObject(ns, _callbacks),
    watchers: getWatchers(model),
  };
}
