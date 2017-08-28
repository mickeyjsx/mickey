import { NAMESPACE_SEP } from './constants';
import { prefixType } from './utils';

export function getActions(model, dispatch) {
  const { actions, namespace } = model;
  return Object.keys(actions).reduce((memo, methodName) => ({
    ...memo,
    [methodName]: (payload) => {
      dispatch({
        payload,
        type: prefixType(namespace, actions[methodName]),
      });
    },
  }), {});
}

function createActions(model, app) {
  const { actions, namespace } = model;
  return Object.keys(actions).reduce((memo, methodName) => ({
    ...memo,
    [methodName]: (payload) => {
      // dispatch will ready after the app started
      const dispatch = app.store.dispatch;
      dispatch({
        payload,
        type: prefixType(namespace, actions[methodName]),
      });
    },
  }), {});
}

export function addAction(app, model) {
  const { actions } = app;
  const { namespace } = model;
  const nss = namespace.split(NAMESPACE_SEP);
  let temp = actions;
  nss.forEach((ns) => {
    if (!temp[ns]) {
      temp[ns] = {};
    }
    temp = temp[ns];
  });

  Object.assign(temp, createActions(model, app));

  return actions;
}

export function removeAction(app, model) {
  const { actions } = app;
  const { namespace } = model;
  const nss = namespace.split(NAMESPACE_SEP);
  const lastIndex = nss.length - 1;

  let temp = actions;
  let removed = null;

  nss.some((ns, index) => {
    if (index === lastIndex || !temp) {
      removed = temp;
      return true;
    }

    temp = temp[ns];
    return false;
  });

  return removed;
}
