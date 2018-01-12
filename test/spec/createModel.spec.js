import { expect } from 'chai'
import createModel from '../../src/createModel'

describe('createModel', () => {
  it('should fix namespace', () => {
    expect(createModel({ namespace: 'a/b.c' }).namespace).to.be.equal('a_b/c')
  })

  it('should return the same `state`, `enhancers` and `createReducer`', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      enhancers: [2],
      createReducer: f => f,
    }
    const ret = createModel(model)

    expect(ret.state).to.be.eql(model.state)
    expect(ret.enhancers).to.be.eql(model.enhancers)
    expect(ret.createReducer).to.be.eql(model.createReducer)
  })

  it('should parse group', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      query: {
        * effect(payload, effects, callbacks) { yield callbacks.succeed() },
        prepare: state => state,
        succeed: state => state,
        failed: state => state,
      },
    }
    const ret = createModel(model)

    expect(ret.actions).to.be.eql({
      query: 'query',
      querySucceed: 'query/succeed',
      queryFailed: 'query/failed',
    })

    expect(ret.reducers).to.be.eql({
      'foo/bar/query': model.query.prepare,
      'foo/bar/query/succeed': model.query.succeed,
      'foo/bar/query/failed': model.query.failed,
    })

    expect(ret.effects).to.be.eql({
      'foo/bar/query': model.query.effect,
    })

    expect(ret.callbacks).to.be.eql({
      'foo/bar/query': ['succeed', 'failed'],
    })
  })

  it('should merge groups', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      reducers: { baz1: state => state },
      effects: { * baz2(payload, effects, callbacks) { yield callbacks.succeed() } },
      query: {
        * effect(payload, effects, callbacks) { yield callbacks.succeed() },
        prepare: state => state,
        succeed: state => state,
        failed: state => state,
      },
      del: {
        * effect(payload, effects, callbacks) { yield callbacks.succeed() },
        prepare: state => state,
        succeed: state => state,
        failed: state => state,
      },
    }
    const ret = createModel(model)

    expect(ret.actions).to.be.eql({
      baz1: 'baz1',
      baz2: 'baz2',
      query: 'query',
      querySucceed: 'query/succeed',
      queryFailed: 'query/failed',
      del: 'del',
      delSucceed: 'del/succeed',
      delFailed: 'del/failed',
    })

    expect(ret.reducers).to.be.eql({
      'foo/bar/baz1': model.reducers.baz1,
      'foo/bar/query': model.query.prepare,
      'foo/bar/query/succeed': model.query.succeed,
      'foo/bar/query/failed': model.query.failed,
      'foo/bar/del': model.del.prepare,
      'foo/bar/del/succeed': model.del.succeed,
      'foo/bar/del/failed': model.del.failed,
    })

    expect(ret.effects).to.be.eql({
      'foo/bar/baz2': model.effects.baz2,
      'foo/bar/query': model.query.effect,
      'foo/bar/del': model.del.effect,
    })

    expect(ret.callbacks).to.be.eql({
      'foo/bar/query': ['succeed', 'failed'],
      'foo/bar/del': ['succeed', 'failed'],
    })
  })

  it('should treat `[Generator, options]` as effect', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      query: {
        effect: [function* effect(payload, effects, callbacks) { yield callbacks.succeed() }, {}],
        prepare: state => state,
        succeed: state => state,
        failed: state => state,
      },
    }
    const ret = createModel(model)
    expect(ret.actions).to.be.eql({
      query: 'query',
      querySucceed: 'query/succeed',
      queryFailed: 'query/failed',
    })

    expect(ret.reducers).to.be.eql({
      'foo/bar/query': model.query.prepare,
      'foo/bar/query/succeed': model.query.succeed,
      'foo/bar/query/failed': model.query.failed,
    })

    expect(ret.effects).to.be.eql({
      'foo/bar/query': model.query.effect,
    })

    expect(ret.callbacks).to.be.eql({
      'foo/bar/query': ['succeed', 'failed'],
    })
  })

  it('shoule parse unGrouped reducers and effects', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      reducer1: state => state,
      reducer2: 1,
      * effect1(payload, effects, callbacks) { yield callbacks.succeed() },
      effect2: [function* effect(payload, effects, callbacks) { yield callbacks.succeed() }, {}],
      effect3: 1,
    }
    const ret = createModel(model)

    expect(ret.actions).to.be.eql({
      reducer1: 'reducer1',
      effect1: 'effect1',
      effect2: 'effect2',
    })

    expect(ret.reducers).to.be.eql({
      'foo/bar/reducer1': model.reducer1,
    })

    expect(ret.effects).to.be.eql({
      'foo/bar/effect1': model.effect1,
      'foo/bar/effect2': model.effect2,
    })

    expect(ret.callbacks).to.be.eql({})
  })

  it('should ignore invalid actions', () => {
    const model = {
      namespace: 'foo.bar',
      state: 1,
      reducers: {
        reducer1: state => state,
        reducer2: 1,
      },
      effects: {
        effect1: function* effect1(payload, effects) { yield effects.call() },
        effect2: [function* effect2(payload, effects) { yield effects.call() }, {}],
        effect3: 1,
      },
      query: {
        * effect(payload, effects, callbacks) { yield callbacks.succeed() },
        prepare: state => state,
        succeed: state => state,
        failed: 1,
      },
    }
    const ret = createModel(model)

    expect(ret.actions).to.be.eql({
      reducer1: 'reducer1',
      effect1: 'effect1',
      effect2: 'effect2',
      query: 'query',
      querySucceed: 'query/succeed',
    })

    expect(ret.reducers).to.be.eql({
      'foo/bar/reducer1': model.reducers.reducer1,
      'foo/bar/query': model.query.prepare,
      'foo/bar/query/succeed': model.query.succeed,
    })

    expect(ret.effects).to.be.eql({
      'foo/bar/effect1': model.effects.effect1,
      'foo/bar/effect2': model.effects.effect2,
      'foo/bar/query': model.query.effect,
    })

    expect(ret.callbacks).to.be.eql({
      'foo/bar/query': ['succeed'],
    })
  })

  it('should throw an error if there are more than one effects in group', () => {
    const badFn = () => {
      createModel({
        namespace: 'foo.bar',
        state: 1,
        query: {
          * effect1(payload, effects, callbacks) { yield callbacks.succeed() },
          * effect2(payload, effects, callbacks) { yield callbacks.succeed() },
          prepare: state => state,
          succeed: state => state,
          failed: state => state,
        },
      })
    }

    expect(badFn).to.throw(/Less than one effect function should be specified in model/)

    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    expect(badFn).to.not.throw()
    process.env.NODE_ENV = env
  })
})
