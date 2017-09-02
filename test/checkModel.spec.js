import { expect } from 'chai'
import checkModel from '../src/checkModel'

describe('checkModel', () => {
  it('namespace should be specified', () => {
    expect(() => {
      checkModel({})
    }).to.throw(/namespace should be specified/)
  })

  it('namespace should be string', () => {
    expect(() => {
      checkModel({ namespace: 1 })
    }).to.throw(/namespace should be string/)
  })

  it('namespace should be unique', () => {
    expect(() => {
      checkModel({
        namespace: '-',
      }, [{
        namespace: '-',

      }])
    }).to.throw(/namespace should be unique/)
  })

  it('reducers should be plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        reducers() { },
      }, [])
    }).to.throw(/reducers should be plain object/)
  })

  it('effects should be plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        reducers: { foo: 'bar' },
        effects() { },
      }, [])
    }).to.throw(/effects should be plain object/)
  })

  it('subscriptions should be plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: [],

      }, [])
    }).to.throw(/subscriptions should be plain object/)
  })

  it('subscriptions should be plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: [],
      }, [])
    }).to.throw(/subscriptions should be plain object/)
  })

  it('subscription should be function', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: { foo: 'bar' },
      }, [])
    }).to.throw(/subscription should be function/)
  })
})
