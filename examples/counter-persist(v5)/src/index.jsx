import React from 'react'
import createApp, { applyMiddleware } from 'mickey'
import { persistStore, persistCombineReducers, REHYDRATE, PERSIST } from 'redux-persist'
import { PersistGate } from 'redux-persist/lib/integration/react'
import createActionBuffer from 'redux-action-buffer'
import App from './App'
import storage from 'redux-persist/lib/storage'
import createFilter from 'redux-persist-transform-filter';
import MickeyPersist from 'mickey-persist';

//specific key to persist
const saveSubsetFilter = createFilter(
  'counter',
  ['count']
);

const persistConfig = {
  transforms: [saveSubsetFilter],
  keyPrefix: 'mickey:',
  storage,
  whitelist: ['counter'],
  key: 'primary'
}
// 1. Initialize
const app = createApp({
  extensions: {
    combineReducers: MickeyPersist( persistCombineReducers.bind(this, persistConfig) ),
  }
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