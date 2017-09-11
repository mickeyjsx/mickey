import { expect } from 'chai'
import Plugin from '../../src/Plugin'

describe('Plugin', () => {
  it('should return a plugin instance', () => {
    const plugin = new Plugin()
    expect(plugin).to.be.an.instanceof(Plugin)
  })

  it('should have empty plugins on the property `hooks` after initialize', () => {
    const plugin = new Plugin()
    Object.keys(plugin.hooks).forEach((key) => {
      const plugins = plugin.hooks[key]
      expect(plugins).to.be.eql([])
    })
  })

  describe('plugin.use(hooks)', () => {
    it('should throw an error if `hooks` is not a plain-object', () => {
      const plugin = new Plugin()
      const badFn = () => { plugin.use(1) }
      expect(badFn).to.throw(/should be plain object/)
    })

    it('should throw an error if given an unknown hook name', () => {
      const plugin = new Plugin()
      const badFn = () => { plugin.use({ foo: 1 }) }
      expect(badFn).to.throw(/unknown hook property/)
    })

    it('should replace `extraEnhancers` when apply a new one', () => {
      const plugin = new Plugin()
      plugin.use({ extraEnhancers: 1 })
      plugin.use({ extraEnhancers: 2 })
      expect(plugin.hooks.extraEnhancers).to.be.eql(2)
    })

    it('should append to plugins set except `extraEnhancers`', () => {
      const hooks = Plugin.hooks
      const plugin = new Plugin()
      hooks.forEach((name) => {
        plugin.use({ [name]: 1 })
      })
      hooks.forEach((name) => {
        plugin.use({ [name]: [2, 3] })
      })
      hooks.forEach((name) => {
        plugin.use({ [name]: 4 })
      })

      hooks.forEach((name) => {
        if (name === 'extraEnhancers') {
          expect(plugin.hooks[name]).to.be.eql(4)
        } else {
          expect(plugin.hooks[name]).to.be.eql([1, 2, 3, 4])
        }
      })
    })
  })

  describe('plugin.get(name)', () => {
    it('should throw error when trying to get hooks with illegal name', () => {
      const plugin = new Plugin()
      const badFn = () => { plugin.get('foo') }
      expect(badFn).to.be.throw(/cannot be got/)
    })

    it('should return an reducer enhance function when get `onReducer`', () => {
      const plugin1 = new Plugin()
      const enhancer1 = plugin1.get('onReducer')

      expect(enhancer1(1)).to.be.equal(1)

      const plugin2 = new Plugin()
      plugin2.use({
        onReducer: [
          state => (state + 1),
          state => (state + 2),
        ],
      })
      const enhancer2 = plugin2.get('onReducer')
      expect(enhancer2(1)).to.be.equal(4)
    })

    it('should return a merge reducer when get `extraReducers`', () => {
      const plugin1 = new Plugin()
      expect(plugin1.get('extraReducers')).to.be.eql({})

      const plugin2 = new Plugin()
      plugin2.use({
        extraReducers: [
          { foo: 'bar' },
          { baz: 1 },
        ],
      })
      expect(plugin2.get('extraReducers')).to.be.eql({ foo: 'bar', baz: 1 })
    })

    it('should return an array called with name except `onReducer` and `extraReducers`', () => {
      const hooks = Plugin.hooks
      const plugin = new Plugin()
      hooks.forEach((name) => {
        plugin.use({ [name]: 1 })
      })
      hooks.forEach((name) => {
        plugin.use({ [name]: [2, 3] })
      })
      hooks.forEach((name) => {
        plugin.use({ [name]: 4 })
      })

      hooks.forEach((name) => {
        if (name !== 'extraEnhancers' && name !== 'onReducer') {
          expect(plugin.hooks[name]).to.be.eql([1, 2, 3, 4])
        }
      })
    })
  })

  describe('plugin.apply(name, defaultHandler)', () => {
    it('should throw error when trying to apply hooks except `onError`', () => {
      const plugin = new Plugin()
      const badFn1 = () => { plugin.apply('foo') }
      const badFn2 = () => { plugin.apply('onAction') }

      expect(badFn1).to.be.throw(/cannot be applied/)
      expect(badFn2).to.be.throw(/cannot be applied/)
    })

    it('should return a handler function', () => {
      const plugin = new Plugin()
      const handler = plugin.apply('onError')
      expect(handler).to.be.an.instanceof(Function)
    })

    it('should work with the specified handlers', () => {
      let errorMessage = ''

      function onError(err) {
        errorMessage = err.message
      }

      const plugin = new Plugin()
      plugin.use({
        onError,
      })
      plugin.apply('onError')({ message: 'Hello Mickey' })
      expect(errorMessage).to.eql('Hello Mickey')
    })

    it('should call default handler if the handlers is empty', () => {
      let errorMessage = ''

      function onError(err) {
        errorMessage = err.message
      }

      const plugin = new Plugin()
      plugin.apply('onError', onError)({ message: 'hello mickey' })
      expect(errorMessage).to.eql('hello mickey')
    })
  })
})
