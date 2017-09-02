import React from 'react'
import createApp from 'mickey'
import Immutable from 'immutable'
import { createReducer, combineReducers } from 'redux-immutablejs'
import App from './App'

// 1. Initialize
const app = createApp({
  initialState: Immutable.fromJS({}),
  extensions: {
    createReducer,
    combineReducers,
  },
})


// 2. Model
app.model(require('./models/counter.js'))

// 3. View
app.render(<App />, document.getElementById('root'))
