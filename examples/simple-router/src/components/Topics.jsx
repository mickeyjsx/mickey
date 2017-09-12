/* eslint-disable react/prop-types */

import React from 'react'
import { Route, Link, connect } from 'mickey'
import Topic from './Topic'
import AddTopic from './AddTopic'

const Topics = ({ topics }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      {
        topics.map((topic, idx) => (
          <li key={topic}>
            <Link to={`/topics/${idx}`}>{topic}</Link>
          </li>
        ))
      }
    </ul>
    <Route
      path={'/topics/:topicId'}
      render={({ match }) => (
        <Topic topic={topics.find((item, idx) => idx === match.params.topicId)} />
      )}
    />
    <Route exact path="/topics" component={AddTopic} />
  </div>
)

export default connect(({ topics }) => ({ topics }))(Topics)
