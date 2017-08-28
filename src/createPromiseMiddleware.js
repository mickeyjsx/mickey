import { NAMESPACE_SEP } from './constants';

export default function createPromiseMiddleware(app) {
  const map = {};

  function isEffect(type) {
    const parts = type.split(NAMESPACE_SEP);
    const namespace = parts.slice(0, -1).join(NAMESPACE_SEP);

    return app.models.some((m) => {
      if (m.namespace === namespace && m.effects[type]) {
        return true;
      }
      return false;
    });
  }

  function wrapped(type, fn, args) {
    if (map[type]) {
      delete map[type];
    }

    fn(args);
  }

  function resolve(type, args) {
    if (map[type]) {
      map[type].resolve(args);
    }
  }

  function reject(type, args) {
    if (map[type]) {
      map[type].reject(args);
    }
  }

  const middleware = () => next => (action) => {
    const { type } = action;
    if (isEffect(type)) {
      // eslint-disable-next-line
      new Promise((_resolve, _reject) => {
        map[type] = {
          resolve: wrapped.bind(null, type, _resolve),
          reject: wrapped.bind(null, type, _reject),
        };
      });
    }
    return next(action);
  };


  return {
    middleware,
    resolve,
    reject,
  };
}
