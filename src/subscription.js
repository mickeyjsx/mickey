import warning from 'warning';
import { isFunction } from './utils';
import prefixDispatch from './prefixDispatch';
import { getActions } from './processAction';

export function run(subscriptions, model, app, onError) {
  const history = app.history;
  const dispatch = app.store.dispatch;
  const innerActions = getActions(model, dispatch);

  const funcs = [];
  const nonFuncs = [];

  Object.keys(subscriptions).forEach((key) => {
    const sub = subscriptions[key];
    const unlistener = sub({
      history,
      dispatch,
      innerDispatch: prefixDispatch(dispatch, model),
    }, innerActions, app.actions, onError);

    if (isFunction(unlistener)) {
      funcs.push(unlistener);
    } else {
      nonFuncs.push(key);
    }
  });

  return { funcs, nonFuncs };
}

export function unlisten(unlisteners, namespace) {
  if (!unlisteners[namespace]) return;

  const { funcs, nonFuncs } = unlisteners[namespace];
  warning(
    nonFuncs.length === 0,
    `subscription.unlisten: subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`,
  );

  funcs.forEach(unlistener => unlistener());
  delete unlisteners[namespace];
}
