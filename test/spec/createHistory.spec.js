import { expect } from 'chai'
import createHistory from '../../src/createHistory'

const routerActions = ['push', 'replace', 'go', 'goBack', 'goForward']


describe('createHistory', () => {
  it('should throw an error when specified an unknown `historyMode`', () => {
    expect(() => { createHistory('foo') }).to.throw(/historyMode "foo" is invalid/)

    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    expect(() => { createHistory('foo') }).to.not.throw()
    process.env.NODE_ENV = env
  })

  it('should return null when no `historyMode` specified', () => {
    expect(createHistory()).to.be.null // eslint-disable-line
    expect(createHistory(0)).to.be.null // eslint-disable-line
    expect(createHistory(false)).to.be.null // eslint-disable-line
  })

  it('should creat a hashHistory when call with \'hash\'', () => {
    const history = createHistory('hash')
    routerActions.forEach((key) => {
      expect(history).to.have.property(key)
    })
  })

  it('should creat a browserHistory when call with \'browser\'', () => {
    const history = createHistory('browser')
    routerActions.forEach((key) => {
      expect(history).to.have.property(key)
    })
  })

  it('should creat a memoryHistory when call with \'memory\'', () => {
    const history = createHistory('memory')
    routerActions.forEach((key) => {
      expect(history).to.have.property(key)
    })
  })
})
