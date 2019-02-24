import { NAMESPACE_SEP } from './constants';
import { App } from './createApp';

export type ExtendedAction = {
  type: string;
  resolver: {
    resolve(value: any | PromiseLike<any>): void;
    reject(reason: any): void;
  };
  then: Promise<any>['then'];
  catcher: Promise<any>['catch'];
  [payload: string]: any;
};

export interface ReduxPromiseMiddleware {
  (): {
    (next: { <A = ExtendedAction>(action: A): A }): {
      (action: ExtendedAction): ExtendedAction
    }
  };
};

export default function createPromiseMiddleware(app: App): ReduxPromiseMiddleware {
  const caches: { [k: string]: 1 | 2 } = {};

  function isEffect(type: string) {
    const cache = caches[type];
    if (cache) {
      return cache === 1; // ! 1 代表是 saga，否则为 2，代表不是，这里可以改进一下，但也不好直接用 true 和 false，因为用 false caches 缓存就无意义了
    }

    const parts = type.split(NAMESPACE_SEP); // ['a', 'b', 'c']
    const namespace = parts.slice(0, -1).join(NAMESPACE_SEP); // 'a/b'

    const ret = app.models.some((m) => {
      if (m.namespace === namespace && m.effects[type]) {
        return true;
      }
      return false;
    })

    caches[type] = ret ? 1 : 2;

    return ret;
  }

  const middleware = () => (next: { <A = ExtendedAction>(action: A): A }) => (action: ExtendedAction): ExtendedAction => {
    const { type } = action;
    if (isEffect(type)) {
      // eslint-disable-next-line
      // * 为 action 添加了 resolver: {resolve, reject}, then, catch 方法，这样在 dispatch action 之后可以调用 promise 的 then, catch。带来的好处是可以像 promise 一样处理，还像原始的 dispatch 一样得到了 action，带来的问题是得到的 action 看起来 promise，让人误解为那个是 promise
      // action should be a plain-object
      (action as any).resolver = {};
      const promise = new Promise((resolve, reject) => {
        action.resolver.resolve = resolve;
        action.resolver.reject = reject;
      });

      action.then = promise.then.bind(promise);
      action.catch = promise.catch.bind(promise);

      return next(action);
    }

    return next(action);
  }

  return middleware;
};
