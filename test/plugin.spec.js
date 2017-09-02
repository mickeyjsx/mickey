import { expect } from 'chai'
import Plugin from '../src/Plugin'

describe('Plugin', () => {
  it('basic', () => {
    const plugin = new Plugin()

    plugin.use({
      onAction: 1,
      onStateChange: 2,
      extraReducers: { form: 1 },
      extraEnhancers: 0,
      onReducer: r => (state, action) => { const res = r(state, action); return res + 1 },
    })

    plugin.use({
      onAction: [2, 3],
      extraEnhancers: 1,
      extraReducers: { user: 2 },
      onReducer: r => (state, action) => { const res = r(state, action); return res * 2 },
    })

    expect(plugin.get('onAction')).to.eql([1, 2, 3])
    expect(plugin.get('onStateChange')).to.eql([2])
    expect(plugin.get('extraEnhancers')).to.eql(1)
    expect(plugin.get('extraReducers')).to.eql({ form: 1, user: 2 })
    expect(plugin.get('onReducer')(state => state + 1)(0)).to.eql(4)
  })

  it('onError', () => {
    let errorMessage = ''

    function onError(err) {
      errorMessage = err.message
    }

    const plugin1 = new Plugin()
    plugin1.apply('onError', onError)({ message: 'hello mickey' })
    expect(errorMessage).to.eql('hello mickey')


    const plugin2 = new Plugin()

    plugin2.use({
      onError,
    })

    plugin2.apply('onError')({ message: 'Hello Mickey' })
    expect(errorMessage).to.eql('Hello Mickey')
  })
})
