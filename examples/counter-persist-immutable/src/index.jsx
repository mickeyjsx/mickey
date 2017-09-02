import React from 'react'
import createApp, { applyMiddleware } from 'mickey'
import Immutable from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import { persistStore, autoRehydrate } from 'redux-persist-immutable'
import immutableTransform from 'redux-persist-transform-immutable'
import { REHYDRATE } from 'redux-persist/constants'
import createActionBuffer from 'redux-action-buffer'
import App from './App'

// 1. Initialize
const app = createApp({
  initialState: Immutable.fromJS({}),
  extensions: {
    createReducer,
    combineReducers,
  },
  hooks: {
    extraEnhancers: [
      // add `autoRehydrate` as an enhancer to your store
      autoRehydrate(),
      // make sure to apply this after autoRehydrate
      applyMiddleware(
        // buffer other reducers before rehydrated
        createActionBuffer(REHYDRATE),
      ),
    ],
  },
})


// 2. Model
app.model(require('./models/counter.js'))

// 3. View
app.render(<App />, document.getElementById('root'), {
  beforeRender: ({ store }) => new Promise(((resolve) => {
    // begin periodically persisting the store
    persistStore(store, {
      debounce: 500,
      whitelist: ['counter'],
      keyPrefix: 'mickey-immutable:',
      transforms: [immutableTransform()],
    }, () => {
      resolve() // delay render after rehydrated
    })
  })),
})
