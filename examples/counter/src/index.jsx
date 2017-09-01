import React from 'react'
import createApp from 'mickey'
import App from './App.jsx'

// 1. Initialize
const app = createApp()

// 2. Model
app.model({
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  reducers: {
    increment: state => ({ ...state, count: state.count + 1 }),
    decrement: state => ({ ...state, count: state.count - 1 }),
  },

  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      const delay = timeout => new Promise((resolve) => {
        setTimeout(resolve, timeout)
      })

      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
})

// 3. View
app.render(<App />, document.getElementById('root'))
