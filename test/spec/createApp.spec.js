import { expect } from 'chai'
import sinon from 'sinon'
import React from 'react'
import EventEmitter from 'events'
import { routerActions } from 'react-router-redux'
import createApp from '../../src/createApp'

describe('createApp', () => {
  describe('options.initialState', () => {
    it('shoule deeply equal to the store after app initialized', () => {
      const initialState = {
        count: 1,
        foo: { bar: { loading: false } },
      }
      const app = createApp({
        initialState,
      })
      app.model({
        namespace: 'count',
        state: 0,
      })
      app.model({
        namespace: 'foo.bar',
        state: { loading: false },
      })
      app.render()

      const state = app.store.getState()
      expect(state.count).to.eql(initialState.count)
      expect(state.foo).to.eql(initialState.foo)
    })

    it('should should have higher priority than model\'s state', () => {
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
  })

  describe('options.historyMode', () => {
    it('should steup corresponding history obj if a valid `historyMode` specified', () => {
      const app = createApp({
        historyMode: 'memory',
      })
      app.render()

      Object.keys(routerActions).forEach((key) => {
        expect(app.history).to.have.property(key)
      })
    })
  })

  describe('options.hooks.onAction', () => {
    it('shoule work as reducer middleware', () => {
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

    it('shoule work with an array-like value', () => {
      let count = 0

      const count1Middleware = () => next => (action) => {
        count += 1
        next(action)
      }

      const count2Middleware = () => next => (action) => {
        count += 2
        next(action)
      }

      const app = createApp({
        hooks: {
          onAction: [count1Middleware, count2Middleware],
        },
      })
      app.render()

      app.store.dispatch({ type: 'test' })
      expect(count).to.equal(3)
    })
  })

  describe('options.hooks.extraEnhancers', () => {
    it('shoule work correctly', () => {
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
  })

  describe('options.hooks.onStateChange', () => {
    it('shoule work correctly', () => {
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
  })

  describe('options.hooks.onEffect', () => {
    it('shoule work correctly', () => {
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
          * effect(payload, { delay }, { succeed }, innerActions) {
            yield delay(2000)
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
  })

  describe('app.has(namespace)', () => {
    it('should return `true` if specified namespace was registered', () => {
      const app = createApp()
      expect(app.has('counter')).to.be.equal(false)
      expect(app.has('foo.bar')).to.be.equal(false)
      expect(app.has('foo/bar')).to.be.equal(false)
      app.model({
        namespace: 'counter',
        state: 0,
      })
      app.model({
        namespace: 'foo.bar',
        state: 0,
      })
      app.model({
        namespace: 'foo/bar',
        state: 0,
      })
      expect(app.has('counter')).to.be.equal(true)
      expect(app.has('foo.bar')).to.be.equal(true)
      expect(app.has('foo/bar')).to.be.equal(true)
    })
  })

  describe('app.load(pattern)', () => {
    it('shoule throw an error if `babel-plugin-mickey-model-loader` was not configed', () => {
      const app = createApp()
      const badFn = () => { app.load() }
      expect(badFn).to.throw(/The method .* is unavailable/)
    })
  })

  describe('app.model(model)', () => {
    it('should got a ations-tree with the same structor as state', () => {
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
          * effect(payload, { delay }, { succeed }, innerActions) {
            yield delay(200)
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

    it('should update state and call subscriptions if inject a model after render', () => {
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
        subscriptions() {
          count += 1
        },
      })
      app.model({
        namespace: 'foo',
        state: 0,
      })

      // subscriptions
      expect(count).to.equal(1)

      // actions
      app.actions.users.add('foo')
      app.actions.tasks.add('bar')
      const state = app.store.getState()
      expect(state.users).to.eql(['foo'])
      expect(state.tasks).to.eql(['bar'])
      expect(state.foo).to.eql(0)
    })

    it('should got these inner methods: `innerDispatch`, `innerPut` and `innerTake`', () => {
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
          * effect(payload, { delay, innerPut }, { succeed }) {
            yield delay(2000)
            yield succeed()
            yield innerPut({ type: 'increment' })
          },
          prepare: state => ({ ...state, loading: true }),
          succeed: state => ({ ...state, loading: false }),
        },
        subscriptions({ innerDispatch }) {
          innerDispatch({ type: 'increment' })
          innerDispatch({ type: 'incrementAsync' })
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

    it('should throw an error if namespace exists', () => {
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
  })

  describe('app.eject(namespace)', () => {
    it('shoule not call subscriptions if called before render', () => {
      let called = false
      const app = createApp()
      app.model({
        namespace: 'a',
        state: 0,
      })
      app.model({
        namespace: 'b.c',
        state: 0,
        subscriptions() {
          called = true
        },
      })

      app.eject('b.c')
      app.render()

      expect(called).to.equal(false)
      expect(app.store.getState().a).to.equal(0)
      expect(app.store.getState().b).to.be.undefined // eslint-disable-line
    })

    it('should remove corresponding sub-state and sub-actions', () => {
      const emitter = new EventEmitter()
      let emitterCount = 0

      const app = createApp()
      app.model({
        namespace: 'a.b.c',
        state: 0,
        add: state => state + 1,
      })
      app.model({
        namespace: 'a.b.d.e.f',
        state: 0,
        add: state => state + 1,
        subscriptions() {
          emitter.on('event', () => { emitterCount += 1 })
          return () => {
            emitter.removeAllListeners()
          }
        },
      })
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render()

      emitter.emit('event')

      const logStub = sinon.stub(console, 'error')
      app.eject('a.b.d.e.f')
      app.eject('foo')
      logStub.restore()

      emitter.emit('event')

      expect(emitterCount).to.equal(1)
      expect(app.actions.a.b.d).to.be.undefined // eslint-disable-line
      const { a, foo } = app.store.getState()
      expect(a.b.c).to.equal(0)
      expect(foo).to.be.undefined // eslint-disable-line

      // some bug with `store.replaceReducer` =>
      // `a.b.d` should be `undefined` but we got `{ e: { f: 1 } }`
      // expect(a.b.d).to.be.undefined // eslint-disable-line
    })

    it('should call corresponding unlistener functions when eject', () => {
      const emitter = new EventEmitter()
      let unlistenerCalled = false

      const app = createApp()
      app.model({
        namespace: 'a',
        state: 0,
      })
      app.model({
        namespace: 'b.c',
        state: 0,
        subscriptions() {
          emitter.on('event', () => { })
          return () => {
            unlistenerCalled = true
            emitter.removeAllListeners()
          }
        },
      })
      app.render()
      emitter.emit('event')
      expect(unlistenerCalled).to.equal(false)

      const logStub = sinon.stub(console, 'error')
      app.eject('b.c')
      logStub.restore()

      emitter.emit('event')
      expect(unlistenerCalled).to.equal(true)
    })
  })

  describe('app.render(Component, container, callback)', () => {
    it('should throw an error if the given container is a selector but none element can be found', () => {
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      const badFn = () => {
        app.render(React.createElement('div'), '#foo')
      }

      expect(badFn).to.throw(/container with selector "#foo" not exist/)
    })

    it('should throw an error if container is not a valid HTMLElement', () => {
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      const badFn = () => {
        app.render(React.createElement('div'), React.createElement('div'))
      }

      expect(badFn).to.throw(/container should be HTMLElement/)
    })

    it('should trigger callback after render', () => {
      let called = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(React.createElement('div'), document.createElement('div'), () => { called = true })
      expect(called).to.equal(true)
    })

    it('should setup history according to `historyMode`', () => {
      let called = false
      let history = null
      const app = createApp({
        historyMode: 'memory',
      })
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(React.createElement('div'), document.createElement('div'), (instance) => {
        called = true
        history = instance.history
      })

      expect(called).to.equal(true)
      Object.keys(routerActions).forEach((key) => {
        expect(history).to.have.property(key)
        expect(app.actions.routing).to.have.property(key)
      })

      expect(app.actions.routing.goBack).to.not.throw()
    })

    it('should work with aop-like callback', () => {
      let beforeRenderCalled = false
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() { beforeRenderCalled = true },
          afterRender() { afterRenderCalled = true },
        })

      expect(beforeRenderCalled).to.equal(true)
      expect(afterRenderCalled).to.equal(true)
    })

    it('should work with `callback.beforeRender`', () => {
      let beforeRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() { beforeRenderCalled = true },
        })

      expect(beforeRenderCalled).to.equal(true)
    })

    it('should not render if `callback.beforeRender` return `false`', () => {
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() { return false },
          afterRender() { afterRenderCalled = true },
        })
      expect(afterRenderCalled).to.equal(false)
    })

    it('should render if `callback.beforeRender` return a promise and the promise resolved', () => {
      let beforeRenderCalled = false
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() {
            beforeRenderCalled = true
            return new Promise((resolve) => {
              resolve()
            })
          },
          afterRender() {
            afterRenderCalled = true
          },
        })

      expect(beforeRenderCalled).to.equal(true)
      expect(afterRenderCalled).to.equal(false)

      setTimeout(() => {
        expect(beforeRenderCalled).to.equal(true)
        expect(afterRenderCalled).to.equal(true)
      }, 100)
    })

    it('should not render if `callback.beforeRender` return a promise and the promise rejected', () => {
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() {
            return new Promise((resole, reject) => {
              reject()
            })
          },
          afterRender() { afterRenderCalled = true },
        })

      expect(afterRenderCalled).to.equal(false)

      setTimeout(() => {
        expect(afterRenderCalled).to.equal(false)
      }, 100)
    })

    it('shoule render with the `callback.beforeRender` resolved Component', () => {
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() {
            return new Promise((resolve) => {
              resolve(React.createElement('div'))
            })
          },
          afterRender() {
            afterRenderCalled = true
          },
        },
      )

      expect(afterRenderCalled).to.equal(false)

      setTimeout(() => {
        expect(afterRenderCalled).to.equal(true)
      }, 100)
    })

    it('shoule render with the `callback.beforeRender` resolved Component and container', () => {
      let afterRenderCalled = false
      const app = createApp()
      app.model({
        namespace: 'foo',
        state: 0,
      })

      app.render(
        React.createElement('div'),
        document.createElement('div'), {
          beforeRender() {
            return new Promise((resolve) => {
              resolve([React.createElement('div'), document.createElement('div')])
            })
          },
          afterRender() {
            afterRenderCalled = true
          },
        })

      expect(afterRenderCalled).to.equal(false)
      setTimeout(() => {
        expect(afterRenderCalled).to.equal(true)
      }, 100)
    })
  })
})
