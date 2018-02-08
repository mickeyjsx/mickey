/* eslint-disable react/prop-types */

import React from 'react'
import { connect, injectActions } from 'mickey'
import './App.css'

const App = props => (
  <div id="counter-app">
    <h1>{props.count}</h1>
    <div className="btn-wrap">
      <button onClick={() => props.actions.counter.decrement()}>-</button>
      <button onClick={() => props.actions.counter.increment()}>+</button>
      <button
        style={{ width: 100 }}
        onClick={() => {
          if (props.loading) {
            alert('loading') // eslint-disable-line
          } else {
            props.actions.counter.incrementAsync()
          }
        }}
      >
        {props.loading ? 'loading' : '+ Async'}
      </button>
    </div>
  </div>
)

export default injectActions(
  connect((store) => {
    console.log('data:', store.counter) // eslint-disable-line
    return ({ ...store.counter })
  })(App),
)
