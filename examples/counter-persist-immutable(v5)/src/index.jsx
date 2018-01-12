import React from 'react'
import createApp, { applyMiddleware } from 'mickey'
import Immutable from 'immutable'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistCombineReducers } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import { PersistGate } from 'redux-persist/lib/integration/react'
import createFilter from 'redux-persist-transform-filter-immutable';
import App from './App'
import { autoMergeImmutable } from './autoMergeImmutable'

//specific key to persist
const saveSubsetFilter = createFilter(
  'counter',
  ['count']
);

const persistConfig = {
  transforms: [saveSubsetFilter, immutableTransform()],
  keyPrefix: 'mickey-immutable:',
  storage,
  whitelist: ['counter'],
  key: 'primary',
  stateReconciler: autoMergeImmutable // rehydrate immutable state
}
// 1. Initialize
const app = createApp({
  initialState: {}, //must be a no-immutable object
  extensions: {
    combineReducers: persistCombineReducers.bind(this, persistConfig),
  },
})

// 2. Model
app.model(require('./models/counter.js'))
// 3. View
app.render(null, document.getElementById('root'), {
  beforeRender: ({ store }) => new Promise(((resolve) => {
    resolve(<PersistGate persistor={persistStore(store)}>
              <App />
            </PersistGate>); 
  })),
})

