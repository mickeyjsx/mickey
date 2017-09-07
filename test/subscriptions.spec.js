import { expect } from 'chai'
import createApp from '../src/createApp'

describe('subscriptions', () => {
  it('arguments', () => {
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
      subscriptions: {
        setup(helpers, innerActions, actions, onError) {
          args.push(helpers, innerActions, actions, onError)
        },
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

  it('dispatch actions', () => {
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
      subscriptions: {
        setup(helpers, innerActions, actions) {
          actions.count.add(2)
          innerActions.sub(1)
        },
      },
    })

    app.render()

    expect(app.store.getState().count).to.eql(2)
    expect(app.store.getState().foo.bar).to.eql(0)
  })
})
