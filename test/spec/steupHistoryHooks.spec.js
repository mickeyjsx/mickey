import { expect } from 'chai'
import { routerReducer } from 'react-router-redux'
import steupHistoryHooks from '../../src/steupHistoryHooks'

describe('steupHistoryHooks', () => {
  it('should do nothing if none `history` specified', () => {
    const history = null
    const hooks = { foo: 'bar' }
    steupHistoryHooks(history, hooks)
    expect(hooks).to.be.eql({ foo: 'bar' })
  })

  it('should add `routerMiddleware` to hooks.onAction when `history` specified', () => {
    const history = true
    const hooks1 = {}
    const hooks2 = { onAction: [1] }
    steupHistoryHooks(history, hooks1)
    steupHistoryHooks(history, hooks2)

    expect(hooks1.onAction.length).to.be.eql(1)
    expect(hooks2.onAction.length).to.be.eql(2)
  })

  it('should add `routerReducer` to hooks.extraReducers when `history` specified', () => {
    const history = true
    const hooks1 = {}
    const hooks2 = { extraReducers: [1] }
    const extraReducer = { router: routerReducer }
    steupHistoryHooks(history, hooks1)
    steupHistoryHooks(history, hooks2)

    expect(hooks1.extraReducers).to.be.eql([extraReducer])
    expect(hooks2.extraReducers).to.be.eql([1, extraReducer])
  })
})

