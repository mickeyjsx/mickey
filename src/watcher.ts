import warning from 'warning';
import { isFunction, getByPath } from './utils'
import { getModelActions } from './actions'
import prefixDispatch from './prefixDispatch'
import { ErrorHandler } from './createErrorHandler';
import { UnderlyingModel } from './createModel';
import { App } from './createApp';

function getState(app: App, path: string, defaultValue: any) {
  const state = app.store.getState();
  return path ? getByPath(state, path, defaultValue) : state;
}

export interface UnListener {
  funcs: Function[];
  nonFuncs: [string, number][];
}
export function startWatchers<S>(model: UnderlyingModel<S>, app: App, onError: ErrorHandler): UnListener {
  const history = app.history;
  const dispatch = app.store.dispatch;
  const innerActions = getModelActions(model, dispatch); // * 即 actionDispatchers

  const funcs: Function[] = [];
  const nonFuncs: [string, number][] = [];

  if (model.watchers) {
    // ? 把所有 watcher 按顺序执行一遍，然后存储 unlisteners 到 funcs, nonFuncs 的作用还不清楚
    model.watchers.forEach((watcher, index) => {
      const unlistener = watcher({
        history,
        getState: (path, defaultValue) => getState(app, path, defaultValue),
        // never need to call the following methods, just export for debug
        dispatch,
        innerDispatch: prefixDispatch(dispatch, model) as any,
      }, innerActions, app.actions, onError);

      if (isFunction(unlistener)) {
        funcs.push(unlistener);
      } else {
        nonFuncs.push([model.namespace, index]);
      }
    });
  }

  return { funcs, nonFuncs };
}

export function stopWatchers(unlisteners: { [k: string]: UnListener }, namespace: string): void {
  if (!unlisteners[namespace]) return;

  const { funcs, nonFuncs } = unlisteners[namespace];
  warning(
    nonFuncs.length === 0,
    `watcher should return unlistener function, check watchers in these models: ${nonFuncs.map(item => item[0]).join(', ')}`,
  );

  funcs.forEach(unlistener => unlistener());
  delete unlisteners[namespace];
}
