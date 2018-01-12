import { expect } from 'chai'
import sinon from 'sinon'
import createApp from '../../src/createApp'

describe('watcher', () => {
  it('should call handlers with correct arguments', () => {
    const args = []
    const app = createApp()
    app.model({
      namespace: 'count',
      state: 0,
      add: (state, payload) => state + payload,
    })
    app.model({
      namespace: 'foo.bar',
      state: 1,
      sub: (state, payload) => state - payload,
      watcher(helpers, innerActions, actions, onError) {
        args.push(helpers, innerActions, actions, onError)
      },
    })
    app.render()

    const [helpers, innerActions, actions, onError] = args
    const { history, getState } = helpers

    expect(history).to.be.null //eslint-disable-line
    expect(getState()).to.eql(app.store.getState())
    expect(getState(['count'])).to.eql(0)
    expect(getState('count')).to.eql(0)
    expect(getState('foo.bar')).to.eql(1)
    expect(getState(['foo', 'bar'])).to.eql(1)

    expect(innerActions).to.have.own.property('sub')

    expect(actions).to.have.deep.nested.property('count.add')
    expect(actions).to.have.deep.nested.property('foo.bar.sub')

    const badFn = () => { onError('error') }
    expect(badFn).to.throw()
  })

  it('should dispatch actions correctly', () => {
    const app = createApp()
    app.model({
      namespace: 'count',
      state: 0,
      add: (state, payload) => state + payload,
    })
    app.model({
      namespace: 'foo.bar',
      state: 1,
      sub: (state, payload) => state - payload,
      watcher(helpers, innerActions, actions) {
        actions.count.add(2)
        innerActions.sub(1)
      },
    })

    app.render()

    expect(app.store.getState().count).to.eql(2)
    expect(app.store.getState().foo.bar).to.eql(0)
  })

  it('should unlisten corresponding listeners when eject model', () => {
    const app = createApp()
    let flag1 = false
    let flag2 = false

    app.model({
      namespace: 'count',
      state: 0,
      watcher() {
        return () => { flag1 = true }
      },
    })
    app.model({
      namespace: 'foo.bar',
      state: 0,
      watcher() {
        return () => { flag2 = true }
      },
    })
    app.render()

    const spy = sinon.stub(console, 'error')

    app.eject('count')
    app.eject('foo.bar')
    spy.restore()

    expect(flag1).to.be.eql(true)
    expect(flag2).to.be.eql(true)
  })

  it('should give a warning message if unlistener is not a function when unlisten', () => {
    const app = createApp()
    app.model({
      namespace: 'count',
      state: 0,
      watcher: [() => null],
    })
    app.model({
      namespace: 'foo.bar',
      state: 0,
    })
    app.render()

    const spy = sinon.stub(console, 'error')

    app.eject('count')
    app.eject('foo.bar')

    expect(spy.secondCall.args[0]).to.match(/watcher should return unlistener function/)

    spy.restore()
  })
})
