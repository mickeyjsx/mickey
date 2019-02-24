// * Mickey 的 hooks 管理模块
import invariant from 'invariant';
import { isPlainObject, getEnhancer } from './utils';
import { Saga } from 'redux-saga';
import { Reducer, ReducersMapObject, StoreEnhancer } from 'redux';
import { ExtraMiddlewares } from './createStore';
import { ExtendedSagaEffects } from './getSaga';
import { App } from './createApp';

interface OnError {
  (e: ErrorEvent): void
}

export interface OnEffect<Op extends {} = {
  app: App;
  model: string; // model 的 namespace
  actions: object; // app 的 actions
  effects: ExtendedSagaEffects; // 自已定义的 sagas
}> {
  (saga: Saga, sagaEffects: any, type: string, metadata: Op): Saga; // TODO: any
}

export interface OnStateChange<State extends {} = {}> { // TODO: State
  (state: State): void;
}

export interface ReducerEnhancer {
  (reducer: Reducer): Reducer;
}

interface InnerHooksStore {
  onError: OnError[]; // saga 错误的回调函数(catch 时)
  onEffect: OnEffect[]; // 包裹 saga 处理的函数
  onStateChange: OnStateChange[]; // store 每次状态变化时的 listener
  onAction: ExtraMiddlewares; // redux 中间件
  onReducer: ReducerEnhancer[]; // reducer 的 enhancer，接收根 reducer，返回新的根 reducer
  extraReducers: ReducersMapObject[]; // 额外的根 reducers，扩展开后可以直接被 combineReducers 使用
  extraEnhancers: StoreEnhancer[]; // Redux 的 storeEnhancer https://redux.js.org/glossary#store-enhancer
};


// 即可以把配置配置成数组，又可以只传递单值，因为写入的时候都会被合并进内部的数组里
export type HooksConfigs = {
  [K in keyof InnerHooksStore]: InnerHooksStore[K] | InnerHooksStore[K][number];
};

/**
 * * 实例对象包含 hooks 属性，原型链中有 use, apply, get 方法
 */
export default class Plugin {
  hooks: InnerHooksStore = {
    onError: [],
    onEffect: [],
    onStateChange: [],
    onAction: [],
    onReducer: [],
    extraReducers: [],
    extraEnhancers: [],
  };

  // 初始化时把 option.hooks 配置进来
  use(passedHooks: Partial<HooksConfigs>): Plugin {
    invariant(isPlainObject(passedHooks), 'hooks should be plain object');

    (Object.keys(passedHooks) as any[]).forEach((key: keyof InnerHooksStore) => {
      invariant(this.hooks[key], `unknown hook property: "${key}"`);
      const passedHook = passedHooks[key];
      if (passedHook) {
        this.hooks[key] = (this.hooks[key] as any).concat(passedHook); // concat() 方法可以合并数组以及单值项
      }
    });

    return this;
  }

  // * 类柯里化的方法，调用 validHooks 中的内容(目前只有 onError )，生成一个函数供后面传参调用
  apply(name: keyof InnerHooksStore, defaultHandler: Function): Function { // TODO: apply 方法名容易引起歧义
    const handlers = this.hooks[name];
    const validHooks = ['onError'];

    invariant(validHooks.includes(name), `plugin.apply: hook "${name}" cannot be applied`);

    return (...args: any[]) => {
      if (handlers.length) {
        (handlers as any[]).forEach((fn) => fn(...args)); // TODO: any
      } else if (defaultHandler) {
        defaultHandler(...args);
      }
    }
  }

  // * 或者对应 hook 的 handlers，其中 extraReducers 和 onReducer 这两个 hook 有点特殊，详见代码
  get(name: keyof InnerHooksStore): ReducersMapObject | ReducerEnhancer | OnError[] | OnEffect[] | OnStateChange[] | ExtraMiddlewares | StoreEnhancer[] {
    const hooks = this.hooks[name];
    invariant(hooks, `hook "${name}" cannot be got`);

    if (name === 'extraReducers') {
      return (hooks as ReducersMapObject[]).reduce((memo: ReducersMapObject, reducersMapObject: ReducersMapObject) => ({ ...memo, ...reducersMapObject }), {});
    } else if (name === 'onReducer') {
      return getEnhancer(hooks as ReducerEnhancer[]); // 存储 onReducer 增强器时，存成数组或者函数，get 获取时，得到 reduce 以后的结果
    }

    return hooks as any; // ? any
  }
};
