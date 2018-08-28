/* eslint-disable react/prop-types */

import React from 'react'
import { injectActions } from '../../../../lib'

const AddTopic = ({ actions }) => {
  let input

  const submit = () => {
    if (input.value.trim()) {
      actions.topics.add(input.value)
      input.value = ''
    }
  }

  return (
    <div>
      <input type="text" ref={(elem) => { input = elem }} />
      <button onClick={submit}>Add Topic</button>
    </div>
  )
}

export default injectActions(AddTopic)
