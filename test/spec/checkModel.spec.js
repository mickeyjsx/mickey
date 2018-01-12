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
})
