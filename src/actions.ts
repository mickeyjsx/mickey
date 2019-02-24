import { NAMESPACE_SEP } from './constants'
import { prefixType } from './utils'
import { UnderlyingModel, ActionDispatcher } from './createModel';
import * as sagaEffects from 'redux-saga/effects';
import { CallbackDispatcher } from './getSaga';
import { App } from './createApp';

export function getModelActions<S extends {} = {}>(model: UnderlyingModel<S>, dispatch: typeof sagaEffects.put): CallbackDispatcher {
  const { actions, namespace } = model;
  return Object.keys(actions).reduce((memo, actionType: string) => ({
    ...memo,
    [actionType]: (payload: any) => dispatch({
      payload,
      type: prefixType(namespace, actions[actionType]),
    }),
  }), {} as CallbackDispatcher);
}

export interface ActionDispatcherMap<S = {}> {
  [k: string]: ActionDispatcher<S>;
}

// * 得到 model 下 actions 的所有 actionDispatchers
function createActions<S extends {} = {}>(app: App, model: UnderlyingModel<S>) {
  const { actions, namespace } = model;
  return Object.keys(actions).reduce((memo: ActionDispatcherMap, methodName: string) => ({
    ...memo,
    // dispatch should be ready after the app started
    [methodName]: (payload: any) => app.store.dispatch({
      payload,
      type: prefixType(namespace, actions[methodName]),
    }),
  }), {} as ActionDispatcherMap);
}

export type RecurActionDispatcher = {
  [k: string]: ActionDispatcher | RecurActionDispatcher;
};
export function addActions<S extends {} = {}>(app: App, model: UnderlyingModel<S>): RecurActionDispatcher {
  const { actions } = app;
  const { namespace } = model;
  const nss = namespace.split(NAMESPACE_SEP);
  let temp: RecurActionDispatcher = actions;
  nss.forEach((ns: string) => {
    if (!temp[ns]) {
      temp[ns] = {};
    }
    temp = temp[ns] as any;
  }) // * 处理多层嵌套的 namespace 的情况

  Object.assign(temp, createActions(app, model)); // * 在最后的 namespace 下加入了新的 actions 以及对应的发出 dispatch 的方法

  return actions; // *  返回大的 actions 对象(是app 的 actionDispatchers)
}

export function removeActions(app: App, namespace: string): ActionDispatcher {
  const { actions } = app;
  const nss = namespace.split(NAMESPACE_SEP);
  const lastIndex = nss.length - 1;

  let temp: RecurActionDispatcher | ActionDispatcherMap = actions;
  let removed: ActionDispatcher = undefined as any;

  nss.forEach((ns, index) => {
    if (index === lastIndex) {
      removed = temp[ns] as ActionDispatcher;
      delete temp[ns];
    } else if (temp) {
      temp = temp[ns] as any;
    }
  });

  // clean sub tree
  for (let i = 0; i < lastIndex; i += 1) { // * 清理掉嵌套层级 namespace 下为空的 namespace，目前的做法只能清除第一次发现为空的情况，如果情况出掉末端以后，新的末端为空，不能进行清理
    temp = actions;
    nss.some((ns) => {
      if (temp && temp[ns]) {
        if (Object.keys(temp[ns]).length === 0) {
          delete temp[ns];
          return true;
        }
        temp = temp[ns] as any;
        return false;
      }

      return true;
    })
  }

  return removed; // * 返回清理掉的 namespace 下的 actions
}
