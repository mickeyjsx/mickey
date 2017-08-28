import invariant from 'invariant';
import { isPlainObject, getEnhancer } from './utils';

const hooks = [
  'onHmr',
  'onError',
  'onStateChange',
  'onAction',
  'onReducer',
  'onEffect',
  'extraReducers',
  'extraEnhancers',
];


export default class Plugin {
  constructor() {
    this.hooks = hooks.reduce((memo, key) => {
      memo[key] = [];
      return memo;
    }, {});
  }

  use(plugins) {
    invariant(isPlainObject(plugins), 'plugin.use: plugin should be plain object');

    Object.keys(plugins).forEach((key) => {
      invariant(this.hooks[key], `plugin.use: unknown plugin property: "${key}"`);
      const plugin = plugins[key];
      if (plugin) {
        if (key === 'extraEnhancers') {
          this.hooks[key] = plugin;
        } else if (Array.isArray(plugin)) {
          this.hooks[key].push(...plugin);
        } else {
          this.hooks[key].push(plugin);
        }
      }
    });

    return this;
  }

  apply(hookName, defaultHandler) {
    const handlers = this.hooks[hookName];
    const validHooks = ['onError', 'onHmr'];

    invariant(validHooks.includes(hookName), `plugin.apply: hook "${hookName}" cannot be applied`);

    return (...args) => {
      if (handlers.length) {
        handlers.forEach(fn => fn(...args));
      } else if (defaultHandler) {
        defaultHandler(...args);
      }
    };
  }

  get(key) {
    const handlers = this.hooks[key];
    invariant(handlers, `plugin.get: hook "${key}" cannot be got`);

    if (key === 'extraReducers') {
      return handlers.reduce((memo, reducer) => ({ ...memo, ...reducer }), {});
    } else if (key === 'onReducer') {
      return getEnhancer(handlers);
    }

    return handlers;
  }
}

