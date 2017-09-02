import React from 'react'
import createApp from 'mickey'
import { persistStore, autoRehydrate } from 'redux-persist'
import { REHYDRATE } from 'redux-persist/constants'
import createActionBuffer from 'redux-action-buffer'
import App from './App'

// 1. Initialize
const app = createApp({
  hooks: {
    // add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
    onAction: [createActionBuffer(REHYDRATE)],
    extraEnhancers: [autoRehydrate()],
  },
})


// 2. Model
app.model(require('./models/counter.js'))

// 3. View
// app.render(<App />, document.getElementById('root'))
app.render(<App />, document.getElementById('root'), {
  beforeRender: ({ store }) => {
    // begin periodically persisting the store
    persistStore(store, {
      debounce: 500,
      whitelist: ['counter'],
      keyPrefix: 'mickey:',
    })
  },
})
