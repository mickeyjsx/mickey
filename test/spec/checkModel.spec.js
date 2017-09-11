import { expect } from 'chai'
import checkModel from '../../src/checkModel'

describe('checkModel', () => {
  it('should throw an error when `namespace` not be specified', () => {
    expect(() => {
      checkModel({})
    }).to.throw(/namespace should be specified/)
  })

  it('should throw an error when `namespace` not be a string', () => {
    expect(() => {
      checkModel({ namespace: 1 })
    }).to.throw(/namespace should be string/)
  })

  it('should throw an error when `namespace` not unique', () => {
    expect(() => {
      checkModel({
        namespace: '-',
      }, [{
        namespace: '-',

      }])
    }).to.throw(/namespace should be unique/)
  })

  it('should throw an error when `reducers` not be a plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        reducers() { },
      }, [])
    }).to.throw(/reducers should be plain object/)
  })

  it('should throw an error when `effects` not be a plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        reducers: { foo: 'bar' },
        effects() { },
      }, [])
    }).to.throw(/effects should be plain object/)
  })

  it('should throw an error when `subscriptions` not be a plain object', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: [],
      }, [])
    }).to.throw(/subscriptions should be plain object/)
  })

  it('should throw an error when the value of `subscriptions` not be a function', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: { foo: 'bar' },
      }, [])
    }).to.throw(/subscription should be function/)
  })
})
