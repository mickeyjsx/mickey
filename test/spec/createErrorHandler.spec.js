import { expect } from 'chai'
import createApp from '../../src/createApp'
import createErrorHandler from '../../src/createErrorHandler'

describe('createErrorHandler', () => {
  it('should return a function', () => {
    const app = createApp()
    expect(createErrorHandler(app)).to.be.an.instanceof(Function)
  })

  it('should use the defaule error handler when no handler specified', () => {
    const app = createApp()
    const handler = createErrorHandler(app)
    expect(handler).to.not.throw()
    expect(() => { handler('foo') }).to.throw('foo')
  })

  it('should call the specified handlers with `error` and `app`', () => {
    let instance
    let error
    const app = createApp({
      hooks: {
        onError: [
          (err, appInstance) => { instance = appInstance },
          (err) => { error = err },
        ],
      },
    })
    const handler = createErrorHandler(app)
    handler(new Error('foo'))

    expect(instance).to.be.eql(app)
    expect(error).to.be.an.instanceOf(Error)
  })
})
