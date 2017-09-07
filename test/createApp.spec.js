import { expect } from 'chai'
import React from 'react'
import createApp from '../src/createApp'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

describe('createApp', () => {
  it('options.initialState', () => {
    const app = createApp({
      initialState: { count: 1 },
    })
    app.model({
      namespace: 'count',
      state: 0,
    })
    app.render()

    expect(app.store.getState().count).to.equal(1)
  })

  it('options.historyMode', () => {
    const app = createApp({
      historyMode: 'memory',
    })
    app.render()

    expect(app.history).to.have.property('push')
    expect(app.history).to.have.property('replace')
    expect(app.history).to.have.property('go')
    expect(app.history).to.have.property('goBack')
    expect(app.history).to.have.property('goForward')
  })

  it('hooks.onAction', () => {
    let count
    const countMiddleware = () => () => () => {
      count += 1
    }

    const app = createApp({
      hooks: {
        onAction: countMiddleware,
      },
    })
    app.render()

    count = 0
    app.store.dispatch({ type: 'test' })
    expect(count).to.equal(1)
  })

  it('hooks.onAction with array', () => {
    let count
    const countMiddleware = () => next => (action) => {
      count += 1
      next(action)
    }
    const count2Middleware = () => next => (action) => {
      count += 2
      next(action)
    }

    const app = createApp({
      hooks: {
        onAction: [countMiddleware, count2Middleware],
      },
    })
    app.render()

    count = 0
    app.store.dispatch({ type: 'test' })
    expect(count).to.equal(3)
  })

  it('hooks.extraEnhancers', () => {
    let count = 0
    const countEnhancer = storeCreator => (reducer, preloadedState, enhancer) => {
      const store = storeCreator(reducer, preloadedState, enhancer)
      const oldDispatch = store.dispatch
      store.dispatch = (action) => {
        count += 1
        oldDispatch(action)
      }
      return store
    }

    const app = createApp({
      hooks: {
        extraEnhancers: [countEnhancer],
      },
    })
    app.render()

    app.store.dispatch({ type: 'abc' })
    expect(count).to.equal(1)
  })

  it('hooks.onStateChange', () => {
    let savedState = null

    const app = createApp({
      hooks: {
        onStateChange(state) {
          savedState = state
        },
      },
    })

    app.model({
      namespace: 'count',
      state: 0,
      add: state => state + 1,
    })
    app.render()

    app.actions.count.add()
    expect(savedState.count).to.equal(1)
  })

  it('hooks.onEffect', () => {
    let data
    let actionType

    const app = createApp({
      hooks: {
        onEffect(effect, sagaEffect, type, metadata) {
          data = metadata
          actionType = type
          return function* doEffect(...args) {
            yield effect(...args)
          }
        },
      },
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
    app.actions.counter.incrementAsync()


    expect(actionType).to.be.equal('counter/incrementAsync')
    expect(data.model).to.be.equal('counter')
  })

  xit('render', () => {
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

    // const badFn = () => {
    //   let a = 0
    //   app.render(React.createElement('div'), '#root', () => {
    //     a = 1
    //   })
    // }

    // expect(badFn).to.throw(/container with id "#root" not exist/)
  })
})
