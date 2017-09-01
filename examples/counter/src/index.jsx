import React from 'react'
import createApp from 'mickey'
import App from './App'

// 1. Initialize
const app = createApp()

// 2. Model
app.model(require('./models/counter.js'))

// 3. View
app.render(<App />, document.getElementById('root'))
