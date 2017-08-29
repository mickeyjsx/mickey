import React from 'react'
import PropTypes from 'prop-types'
import { ConnectedRouter, routerActions } from 'react-router-redux'
import { Provider as StoreProvider } from 'react-redux'
import actions from './actions'


const Provider = ({ children, app }) => {
  const child = React.Children.only(children)
  if (app.history) {
    // Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.routing,
    // when called, will dispatch the crresponding action provided by react-router-redux.
    actions.routing = Object.keys(routerActions).reduce((memo, action) => ({
      ...memo,
      [action]: (...args) => {
        app.store.dispatch(routerActions[action](...args))
      },
    }), {})

    return (
      <StoreProvider store={app.store}>
        <ConnectedRouter history={app.history} >
          {child}
        </ConnectedRouter>
      </StoreProvider>
    )
  }

  return (
    <StoreProvider store={app.store}>
      {child}
    </StoreProvider>
  )
}

Provider.propTypes = {
  children: PropTypes.element.isRequired,
  app: PropTypes.shape({
    store: PropTypes.object,
    history: PropTypes.object,
  }).isRequired,
}

export default Provider
