/* eslint-disable react/prop-types */

import React from 'react'
import { injectActions } from 'mickey'

const Topic = ({ topic, actions }) => (
  <div>
    <h3>{topic || 'Topic not found'}</h3>
    <button onClick={() => actions.routing.push('/topics')}>Back</button>
  </div>
)

export default injectActions(Topic)
