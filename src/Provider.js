import warning from 'warning'
import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import { Provider as StoreProvider } from 'react-redux'
import { ConnectedRouter, routerActions } from 'connected-react-router'
import ActionsProvider from './ActionsProvider'


export default class Provider extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    app: PropTypes.shape({
      store: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      history: PropTypes.object,
    }).isRequired,
  }

  addRouterActions() {
    const { app } = this.props
    if (app.history) {
      // Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.router,
      // when called, will dispatch the crresponding action provided by connected-react-router.
      app.actions.router = Object.keys(routerActions).reduce((memo, action) => ({
        ...memo,
        [action]: (...args) => {
          app.store.dispatch(routerActions[action](...args))
        },
      }), {})

      app.actions.routing = Object.keys(routerActions).reduce((memo, action) => ({
        ...memo,
        [action]: (...args) => {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              '\'app.actions.routing\' is deprecated, use \'app.actions.router\' instead.',
            )
          }

          app.store.dispatch(routerActions[action](...args))
        },
      }), {})
    }
  }

  renderProvider(Component) {
    const { app } = this.props

    return createElement(ActionsProvider, { actions: app.actions },
      createElement(StoreProvider, { store: app.store },
        Component,
      ),
    )
  }

  render() {
    const { children, app } = this.props
    const child = React.Children.only(children)
    this.addRouterActions()
    return this.renderProvider(
      app.history
        ? createElement(ConnectedRouter, { history: app.history }, child)
        : child,
    )
  }
}
