import { expect } from 'chai'
import EventEmitter from 'events'
import createApp from '../src/createApp'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

describe('model', () => {
  it('effects', () => {
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
        * effect(payload, { call }, { succeed }, innerActions) {
          yield call(delay, 2000)
          yield succeed()
          yield innerActions.increment()
        },
        prepare: state => ({ ...state, loading: true }),
        succeed: state => ({ ...state, loading: false }),
      },
    })
    app.render()

    app.actions.counter.increment()
    app.actions.counter.incrementAsync()

    let state = app.store.getState()
    expect(state.counter.count).to.be.equal(1)
    expect(state.counter.loading).to.be.equal(true)
    setTimeout(() => {
      state = app.store.getState()
      expect(state.counter.count).to.be.equal(2)
      expect(state.counter.loading).to.be.equal(false)
    }, 2500)
  })

  it('inject model after render', () => {
    let count = 0
    const app = createApp()
    app.model({
      namespace: 'users',
      state: [],
      add: (state, payload) => [...state, payload],
    })
    app.render()
    app.model({
      namespace: 'tasks',
      state: [],
      add: (state, payload) => [...state, payload],
      subscriptions: {
        setup() {
          count += 1
        },
      },
    })

    // subscriptions
    expect(count).to.equal(1)

    // actions
    app.actions.users.add('foo')
    app.actions.tasks.add('bar')
    const state = app.store.getState()
    expect(state.users).to.eql(['foo'])
    expect(state.tasks).to.eql(['bar'])
  })

  it('don\'t inject if namespace exists', () => {
    const app = createApp()
    const model = {
      namespace: 'count',
      state: 0,
    }

    app.model(model)
    app.render()

    expect(() => {
      app.model(model)
    }).to.throw(/namespace should be unique/)
  })

  it('eject a model', () => {
    const emitter = new EventEmitter()
    let emitterCount = 0

    const app = createApp()
    app.model({
      namespace: 'a',
      state: 0,
      add: state => state + 1,
    })
    app.model({
      namespace: 'b.c',
      state: 0,
      add: state => state + 1,
      * addBoth(payload, callbacks, innerActions, actions) {
        yield actions.a.add()
        yield innerActions.add()
      },
      subscriptions: {
        setup() {
          emitter.on('event', () => { emitterCount += 1 })
          return () => {
            emitter.removeAllListeners()
          }
        },
      },
    })
    app.render()

    emitter.emit('event')
    app.eject('b.c')
    emitter.emit('event')

    expect(app.actions.b.c).to.be.undefined // eslint-disable-line
    const { a, b } = app.store.getState()
    expect(emitterCount).to.equal(1)
    expect(a).to.equal(0)
    expect(b).to.be.undefined // eslint-disable-line
  })

  it('innerDispatch, innerPut, innerTake', () => {
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
        * effect(payload, { call, innerPut }, { succeed }) {
          yield call(delay, 2000)
          yield succeed()
          yield innerPut({ type: 'increment' })
        },
        prepare: state => ({ ...state, loading: true }),
        succeed: state => ({ ...state, loading: false }),
      },
      subscriptions: {
        setup({ innerDispatch }) {
          innerDispatch({ type: 'increment' })
          innerDispatch({ type: 'incrementAsync' })
        },
      },
    })
    app.render()

    let state = app.store.getState()
    expect(state.counter).to.be.eql({ count: 1, loading: true })

    setTimeout(() => {
      state = app.store.getState()
      expect(state.counter).to.be.eql({ count: 2, loading: false })
    }, 3000)
  })
})
