/* eslint-disable react/prop-types */

import React from 'react'
import { HashRouter as Router, Route, Switch } from 'mickey'
import Header from './components/Header'
import Home from './components/Home'
import About from './components/About'
import Topics from './components/Topics'

const Routers = () => (
  <div>
    <Header />
    <hr />
    <div>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/topics" component={Topics} />
        </Switch>
      </Router>
    </div>
  </div>
)

export default Routers
