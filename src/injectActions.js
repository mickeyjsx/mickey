import invariant from 'invariant'
import React from 'react'
import PropTypes from 'prop-types'

function getDisplayName(Component) {
  const name = Component.displayName || Component.name || 'Component'
  return `injectActions(${name})`
}

export default function injectActions(WrappedComponent, options = {}) {
  const { propName = 'actions', withRef = false } = options

  class InjectActions extends React.Component {
    constructor(props, context) {
      super(props, context)
      const { actions } = context
      if (process.env.NODE_ENV !== 'production') {
        invariant(
          actions,
          '[injectActions] Could not find required `actions` object. ' +
          '<ActionsProvider> needs to exist in the component ancestry.',
        )
      }
    }

    getWrappedInstance() {
      if (process.env.NODE_ENV !== 'production') {
        invariant(
          withRef,
          '[React Intl] To access the wrapped instance, ' +
          'the `{withRef: true}` option must be set when calling: ' +
          '`injectIntl()`',
        )
      }
      return this.wrappedInstance
    }

    render() {
      const props = {
        ...this.props,
        [propName]: this.context.actions,
      }

      if (withRef) {
        props.ref = (wrappedInstance) => { this.wrappedInstance = wrappedInstance }
      }

      return React.createElement(WrappedComponent, props)
    }
  }

  InjectActions.WrappedComponent = WrappedComponent
  InjectActions.displayName = getDisplayName(WrappedComponent)
  InjectActions.contextTypes = {
    actions: PropTypes.object.isRequired,
  }

  return InjectActions
}
