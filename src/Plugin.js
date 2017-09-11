import invariant from 'invariant'
import { isPlainObject, getEnhancer } from './utils'


export default class Plugin {
  static hooks = [
    'onError',
    'onEffect',
    'onStateChange',

    'onAction',
    'onReducer',
    'extraReducers',
    'extraEnhancers',
  ]

  constructor() {
    this.hooks = Plugin.hooks.reduce((memo, name) => {
      memo[name] = []
      return memo
    }, {})
  }

  use(plugins) {
    invariant(isPlainObject(plugins), 'hook should be plain object')

    Object.keys(plugins).forEach((key) => {
      invariant(this.hooks[key], `unknown hook property: "${key}"`)
      const plugin = plugins[key]
      if (plugin) {
        if (key === 'extraEnhancers') {
          this.hooks[key] = plugin
        } else if (Array.isArray(plugin)) {
          this.hooks[key].push(...plugin)
        } else {
          this.hooks[key].push(plugin)
        }
      }
    })

    return this
  }

  apply(name, defaultHandler) {
    const handlers = this.hooks[name]
    const validHooks = ['onError']

    invariant(validHooks.includes(name), `plugin.apply: hook "${name}" cannot be applied`)

    return (...args) => {
      if (handlers.length) {
        handlers.forEach(fn => fn(...args))
      } else if (defaultHandler) {
        defaultHandler(...args)
      }
    }
  }

  get(name) {
    const handlers = this.hooks[name]
    invariant(handlers, `hook "${name}" cannot be got`)

    if (name === 'extraReducers') {
      return handlers.reduce((memo, reducer) => ({ ...memo, ...reducer }), {})
    } else if (name === 'onReducer') {
      return getEnhancer(handlers)
    }

    return handlers
  }
}

