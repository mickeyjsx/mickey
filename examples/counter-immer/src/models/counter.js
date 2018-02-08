import produce from 'immer'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

export default {
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  increment: state => produce(state, (draft) => { draft.count += 1 }),
  decrement: state => produce(state, (draft) => { draft.count -= 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => produce(state, (draft) => { draft.loading = true }),
    succeed: state => produce(state, (draft) => {
      draft.count += 1
      draft.loading = false
    }),
  },
}
