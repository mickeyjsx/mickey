import React from 'react'
import ReactDOM from 'react-dom'
import Provider from './Provider'

import { isFunction } from './utils'

function getCallbacks(options = {}) {
  if (isFunction(options)) {
    return { afterRender: options }
  }
  return options
}

export default function createRender(app, component, container, callback) {
  return (_component, _container, _callback) => {
    const { beforeRender, afterRender } = getCallbacks(_callback || callback || {})
    const innerRender = (componentFromPromise, containerFromPromise) => {
      const comp = componentFromPromise || component
      const wrap = containerFromPromise || container
      const canRender = comp && wrap
      if (canRender) {
        ReactDOM.render(<Provider app={app}>{comp}</Provider>, wrap); // eslint-disable-line

        if (afterRender) {
          afterRender(app)
        }
      }
    }

    let ret = true
    if (beforeRender) {
      ret = beforeRender(app)
    }

    if (ret && ret.then) {
      ret.then(innerRender, () => { })
    } else if (ret !== false) {
      innerRender(_component, _container)
    }
  }
}
