import invariant from 'invariant'
import React from 'react'
import ReactDOM from 'react-dom'
import Provider from './Provider'
import { isFunction, isString, isHTMLElement } from './utils'


function getCallbacks(options) {
  if (isFunction(options)) {
    return { afterRender: options }
  }
  return options || {}
}


export default function createRender(app, component, container, callback) {
  // return a render function
  return (_component, _container, _callback) => {
    const { beforeRender, afterRender } = getCallbacks(_callback || callback)
    // real render function
    const innerRender = (componentFromPromise, containerFromPromise) => {
      const innerComponent = componentFromPromise || component
      let innerContainer = containerFromPromise || container

      if (innerContainer) {
        if (isString(innerContainer)) {
          innerContainer = document.querySelector(innerContainer)
          invariant(innerContainer, `container with selector "${container}" not exist`)
        }

        invariant(isHTMLElement(innerContainer), 'container should be HTMLElement')
      }

      const canRender = innerComponent && innerContainer
      if (canRender) {
        ReactDOM.render(
          React.createElement(Provider, { app }, innerComponent),
          innerContainer,
        )

        if (afterRender) {
          afterRender(app)
        }
      }
    }

    let result = true
    if (beforeRender) {
      result = beforeRender(app)
    }

    if (result && result.then) {
      result.then((val) => {
        if (val) {
          if (Array.isArray(val)) {
            innerRender(...val)
          } else {
            innerRender(val, _container)
          }
        } else {
          innerRender(_component, _container)
        }
      }, () => { })
    } else if (result !== false) {
      innerRender(_component, _container)
    }
  }
}
