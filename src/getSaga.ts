/* eslint-disable func-names */
import warning from 'warning';
import invariant from 'invariant';
import { CANCEL as CANCEL_DELAY, Saga } from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import { takeEvery, takeLatest, throttle, delay, PutEffect, TakeEffect } from 'redux-saga/effects';
import { AnyAction } from 'redux';
import { CANCEL_EFFECTS, MUTATE } from './constants'
import { prefixType, unfixType, prefixAndValidate } from './utils'
import { getModelActions } from './actions'
import { ErrorHandler } from './createErrorHandler';
import { OnEffect } from './plugin';
import { Mickey, UnderlyingModel, ThrottleTaskType, MickeyControlType, MickeyTask } from './createModel';
import { App } from './createApp';
import { ExtendedAction } from './createPromiseMiddleware';



function applyOnEffect(
  onEffectHandlers: OnEffect[],
  sagaWithCatch: { (a: ExtendedAction): IterableIterator<any> },
  actionType: string,
  metadata: { app: App; model: string; actions: App['actions']; effects: ExtendedSagaEffects }
): Saga {
  return onEffectHandlers.reduce(
    (saga, onEffectHandler) => onEffectHandler(saga, sagaEffects, actionType, metadata), // ! 单个 onEffect hook 的用法，逻辑还不清楚，从 reduce 函数的第二参数来看，这里也要返回一个 saga(Generator)
    sagaWithCatch,
  );
}

// signature: *effect(payload, {call, digest}, callbacks, innerActions, actions) { }
// usage: const result = yield digest(generator, arg1, arg2, ...)
function* callGenerator(fn: Function, ...args: any): any {
  const ret = yield fn(...args);
  if (ret.then) {
    return yield new Promise((resolve) => {
      ret.then((data: any) => resolve(data));
    });
  }

  return ret;
}

export type ExtendedSagaEffects = {
  delay: typeof delay;
  CANCEL_DELAY: typeof CANCEL_DELAY;
  innerPut<A extends AnyAction>(action: A): PutEffect<A>;
  innerTake(type: string): TakeEffect;
  [MUTATE](payload: any, debug: any): PutEffect;
  digest: typeof callGenerator;
} & typeof sagaEffects;

/**
 * ? 为一个 model 添加除了 redux-saga 提供的 effect 函数外更多的 effect，相当于扩展了 redux-saga 中的 effect
 * @param {一个格式化以后的 model} model
 * @returns {object} effects
 */
function getEffects<S extends {} = {}>(model: UnderlyingModel<S>): ExtendedSagaEffects {
  const { put, take } = sagaEffects;
  const { namespace } = model;

  function assertAction(type: string, name: string): never | void {
    invariant(type, `${name}: action should be a plain Object with type`);
    warning(
      type.indexOf(prefixType(namespace, '')) !== 0,
      `${name}: ${type} should not be prefixed with namespace "${namespace}"`,
    );
  }

  function innerPut<A extends AnyAction>(action: A): PutEffect<A> {
    const { type } = action;
    assertAction(type, 'innerPut');
    return put({ ...action, type: prefixAndValidate(type, model) });
  }

  function innerTake(type: string): TakeEffect {
    if (typeof type === 'string') {
      assertAction(type, 'innerTake');
      return take(prefixAndValidate(type, model));
    }
    return take(type);
  }

  function mutate(payload: any, debug: any): PutEffect {
    const action = {
      payload,
      type: prefixType(namespace, model.actions[MUTATE]),
    };

    if (process.env.NODE_ENV !== 'production' && debug) {
      (action as any).debug = debug; // This debug field will be returned after dispatching action
    }

    return put(action);
  }

  return {
    ...sagaEffects,
    delay,
    CANCEL_DELAY,
    innerPut,
    innerTake,
    [MUTATE]: mutate,
    digest: callGenerator,
  };
}

export interface CallbackDispatcher {
  [k: string]: (p: any) => PutEffect
}
// * 即获取单元内除 saga 外的其它部分(应该是所有的 reducers 的名字)，因为之前 createModel 时存到了 callbacks 里面，所以叫 getCallbacks，得到 callback 对应的 actionDispatchers
function getCallbackDispatchers<S extends {} = {}>(model: UnderlyingModel<S>, actionType: string): CallbackDispatcher {
  const { put } = sagaEffects;
  const { namespace, effects, callbacks } = model;
  const actionDispatchers: CallbackDispatcher = {};
  if (effects[actionType] && callbacks[actionType]) {
    callbacks[actionType].forEach((callbackName: string) => {
      actionDispatchers[callbackName] = (payload: any) => {
        const actionName = unfixType(namespace, actionType);
        const prefixed = prefixType(actionName, callbackName);
        const fullType = prefixAndValidate(prefixed, model);
        return put({ payload, type: fullType });
      };
    });
  }

  return actionDispatchers;
}

function getWatcher<S extends {} = {}>(params: { onError: ErrorHandler, onEffect: OnEffect[], app: App, model: UnderlyingModel<S>, type: string, effect: Mickey }): Saga {
  const { onError, onEffect, app, model, type, effect } = params;
  let mickey: Mickey = effect;
  let effectType: MickeyControlType['type'] = 'takeEvery';
  let ms: number;

  if (Array.isArray(effect)) { // * 元组形式的 mickey
    mickey = effect[0];
    const options = effect[1];
    if (options && options.type) {
      effectType = options.type;
      if (effectType === 'throttle') {
        invariant(
          (options as ThrottleTaskType).ms,
          'options.ms should be defined if type is throttle',
        );
        ms = (options as ThrottleTaskType).ms;
      }
    }
    invariant(
      ['watcher', 'takeEvery', 'takeLatest', 'throttle'].includes(effectType),
      'effect type should be takeEvery, takeLatest, throttle or watcher',
    );
  }

  const actions = app.actions;
  const extendedSagaEffects: ExtendedSagaEffects = getEffects(model);
  const inMickeyActionDispatchers: CallbackDispatcher = getCallbackDispatchers(model, type); // * 一个 model 中的 object 单元除了 saga 外剩余部分对应的 actionDispatchers
  const inModelActionDispatchers: CallbackDispatcher = getModelActions(model, extendedSagaEffects.put); // * model 内的 actions 对应的 actionDispatchers

  function* sagaWithCatch(action: ExtendedAction): IterableIterator<any> {
    const { payload, resolver: { resolve, reject } } = action;
    try {
      const ret = yield (mickey as MickeyTask)(
        payload,
        { ...extendedSagaEffects, resolve, reject }, // * 支持在 一个 mickey 中调用 resolve 和 reject
        inMickeyActionDispatchers, // object unit 单元内部的 actionDispatchers
        inModelActionDispatchers, // 一个 model 内部的 actionDispatchers
        actions, // 整个 app 的 actionDispatchers
      ); // ! 这个地方决定了 mickey 中一个 saga(那个 Generator 函数) 的调用方式 !!!
      // 默认调用 resolve，ret 是在 effect 函数的返回值(return ret)
      // 如果在业务逻辑中已经触发 resolve，那么此处的 resolve 将不会生效
      resolve(ret);
    } catch (err) {
      onError(err);
      reject(err);
    }
  }

  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, type, {
    app,
    model: model.namespace,
    actions,
    effects: extendedSagaEffects,
  }); // * 应用 onEffect hook，把一些信息传递进去，方便实现 onEffect hook 需要传递的参数，最后得到一个包裹了 onEffect 的 saga

  switch (effectType) {
    case 'watcher':
      return sagaWithCatch; // ! watcher 类型就是每次都会调用 saga
    case 'takeLatest':
      return function* () {
        yield takeLatest(type, sagaWithOnEffect);
      };
    case 'throttle':
      return function* () {
        yield throttle(ms, type, sagaWithOnEffect);
      };
    default:
      return function* () {
        yield takeEvery(type, sagaWithOnEffect);
      };
  }
}

function getTask<S extends {} = {}>(model: UnderlyingModel<S>, effectType: string, watcher: Saga): Saga {
  const { namespace } = model;
  return function* run() {
    const task = yield sagaEffects.fork(watcher) // * 非阻塞执行 watcher
    yield sagaEffects.fork(function* (): IterableIterator<any> {
      const { cancel } = yield sagaEffects.race({
        cancel: sagaEffects.take(prefixType(effectType, CANCEL_EFFECTS)),
        eject: sagaEffects.take(prefixType(namespace, CANCEL_EFFECTS)),
      }) // * cancel 或者 eject 时 cancel

      yield sagaEffects.cancel(task)

      if (cancel) {
        yield sagaEffects.fork(run) // ! 取消当次的 watch 以后，重新开始 watch
      }
    })
  };
}

// * 返回一个 model 对应的外层 saga，外层 saga 内部包含了 model 内的所有需要的 saga
export default function getSaga<S extends {} = {}>(
  onError: ErrorHandler,
  onEffect: OnEffect[],
  app: App,
  model: UnderlyingModel<S>
): Saga {
  return function* (): IterableIterator<any> {
    const { effects } = model;
    const mickeyTypes = Object.keys(effects);
    for (let i = 0; i < mickeyTypes.length; i += 1) { // TODO: 这里带来一个问题是，内部的 saga 只能一个一个地执行
      const mickeyType: string = mickeyTypes[i];
      const watcher: Saga = getWatcher({ onError, onEffect, app, model, type: mickeyType, effect: effects[mickeyType] }); // * 获得对应 action type 的 saga watcher
      const task: Saga = getTask(model, mickeyType, watcher); // ? 获得执行 task 的函数(即 worker )，应该已经用 watcher 包裹了？
      yield sagaEffects.fork(task);
    }
  }
};
