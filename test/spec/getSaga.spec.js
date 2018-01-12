import { expect } from 'chai'
import sinon from 'sinon'
import createApp from '../../src/createApp'

describe('getSata', () => {
  it('should inject actions to async reducers', () => {
    const app = createApp()
    app.model({
      namespace: 'foo',
      state: 0,
      add: state => state + 1,
    })
    app.model({
      namespace: 'counter',
      state: {
        count: 0,
        loading: false,
      },
      increment: state => ({ ...state, count: state.count + 1 }),
      decrement: state => ({ ...state, count: state.count - 1 }),
      incrementAsync: {
        * effect(payload, effects, { succeed }, innerActions, actions) {
          yield succeed()
          yield innerActions.increment()
          yield actions.foo.add()
        },
        prepare: state => ({ ...state, loading: true }),
        succeed: state => ({ ...state, loading: false }),
      },
    })
    app.render()

    app.actions.counter.increment()
    app.actions.counter.incrementAsync()

    const state = app.store.getState()
    expect(state.foo).to.be.equal(1)
    expect(state.counter.count).to.be.equal(2)
    expect(state.counter.loading).to.be.equal(false)
  })

  it('should inject actions to watcher', () => {
    const app = createApp()
    app.model({
      namespace: 'foo',
      state: 0,
      add: state => state + 1,
    })
    app.model({
      namespace: 'counter',
      state: {
        count: 0,
        loading: false,
      },
      increment: state => ({ ...state, count: state.count + 1 }),
      decrement: state => ({ ...state, count: state.count - 1 }),
      incrementAsync: {
        * effect(payload, { innerPut }, { succeed }, innerActions, actions) {
          yield succeed()
          yield innerPut({ type: 'increment' })
          yield innerActions.increment()
          yield actions.foo.add()
        },
        prepare: state => ({ ...state, loading: true }),
        succeed: state => ({ ...state, loading: false }),
      },
      watcher(helpers, innerActions, actions) {
        helpers.dispatch({ type: 'foo/add' })
        helpers.innerDispatch({ type: 'increment' })
        innerActions.incrementAsync()
        actions.foo.add()
      },
    })
    app.render()

    const state = app.store.getState()
    expect(state.foo).to.be.equal(3)
    expect(state.counter.count).to.be.equal(3)
    expect(state.counter.loading).to.be.equal(false)
  })

  it('should throw an error if effect type is `throttle` but no throttle duration specified', () => {
    const app = createApp()
    app.model({
      namespace: 'foo',
      state: 0,
      incrementAsync: {
        effect: [
          function* effect(payload, { delay }) {
            yield delay(10)
          },
          { type: 'throttle' },
        ],
      },
    })

    const logStub = sinon.stub(console, 'error')
    app.render()
    expect(logStub.callCount).to.be.eql(1)
    expect(logStub.firstCall.args[1]).to.be.match(/options\.ms should be defined if type is throttle/)
    logStub.restore()
  })

  it('should inject `innerTake` to async reducers', () => {
    const app = createApp()
    app.model({
      namespace: 'counter',
      state: {
        count: 0,
        loading: false,
      },
      increment: state => ({ ...state, count: state.count + 1 }),
      decrement: state => ({ ...state, count: state.count - 1 }),
      incrementAsync: {
        * effect(payload, { innerPut, innerTake }, { succeed }) {
          innerTake('increment')
          yield succeed()
          yield innerPut({ type: 'increment' })
        },
        prepare: state => ({ ...state, loading: true }),
        succeed: state => ({ ...state, loading: false }),
      },
    })
    app.render()

    app.actions.counter.incrementAsync()
    app.actions.counter.increment()

    const state = app.store.getState()
    expect(state.counter.count).to.be.equal(2)
    expect(state.counter.loading).to.be.equal(false)
  })
})
