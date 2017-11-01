import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import { Provider as StoreProvider } from 'react-redux'
import { ConnectedRouter, routerActions } from 'react-router-redux'
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

  addRoutingActions() {
    const { app } = this.props
    if (app.history) {
      // Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.routing,
      // when called, will dispatch the crresponding action provided by react-router-redux.
      app.actions.routing = Object.keys(routerActions).reduce((memo, action) => ({
        ...memo,
        [action]: (...args) => {
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
    this.addRoutingActions()
    return this.renderProvider(
      app.history
        ? createElement(ConnectedRouter, { history: app.history }, child)
        : child,
    )
  }
}
