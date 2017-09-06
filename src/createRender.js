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
      const comp = componentFromPromise || component
      let wrap = containerFromPromise || container

      if (wrap) {
        if (isString(wrap)) {
          wrap = document.getElementById(wrap)
          invariant(wrap, `[app.render] container with id "${container}" not exist`)
        }

        invariant(isHTMLElement(wrap), '[app.render] container should be HTMLElement')
      }


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
      ret.then((val) => {
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
    } else if (ret !== false) {
      innerRender(_component, _container)
    }
  }
}
