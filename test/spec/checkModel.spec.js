import { expect } from 'chai'
import sinon from 'sinon'
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

  it('should give a warning message when `subscriptions` is an object', () => {
    const spy = sinon.stub(console, 'error')
    checkModel({
      namespace: '-',
      subscriptions: {
        setup() { },
      },
    }, [])

    expect(spy.firstCall.args[0]).to.match(/plain object is deprecated/)
    spy.restore()
  })

  it('should throw an error when `subscriptions` not be a function or function array', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: 1,
      }, [])
    }).to.throw(/subscriptions should be a function or array of functions/)
  })

  it('should throw an error when the value of `subscriptions` not be a function', () => {
    expect(() => {
      checkModel({
        namespace: '-',
        subscriptions: [1, f => f],
      }, [])
    }).to.throw(/subscription should be function/)
  })
})
