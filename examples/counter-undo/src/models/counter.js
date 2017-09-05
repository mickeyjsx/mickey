import undoable from 'redux-undo'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

export default {
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  enhancers: [
    reducer => (state, action) => {
      const undoOpts = {}
      const newState = undoable(reducer, undoOpts)(state, action)
      return { ...newState }
    },
  ],
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
}
