import { expect } from 'chai'
import Plugin from '../src/Plugin'

describe('Plugin', () => {
  it('basic', () => {
    let errorMessage = ''

    function onError(err) {
      errorMessage = err.message
    }

    const plugin = new Plugin()

    plugin.use({
      onStateChange: 2,
      onAction: 1,
      extraReducers: { form: 1 },
      onReducer: r => (state, action) => { const res = r(state, action); return res + 1 },
    })

    plugin.use({
      extraReducers: { user: 2 },
      onReducer: r => (state, action) => { const res = r(state, action); return res * 2 },
    })

    plugin.apply('onError', onError)({ message: 'hello mickey' })
    expect(errorMessage).to.eql('hello mickey')

    expect(plugin.get('extraReducers')).to.eql({ form: 1, user: 2 })
    expect(plugin.get('onAction')).to.eql([1])
    expect(plugin.get('onStateChange')).to.eql([2])
    expect(plugin.get('onReducer')(state => state + 1)(0)).to.eql(4)
  })
})
