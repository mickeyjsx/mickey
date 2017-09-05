import React from 'react'
import PropTypes from 'prop-types'

export function createProvider(actionsKey = 'actions') {
  class Provider extends React.Component {
    constructor(props, context) {
      super(props, context)
      this[actionsKey] = props.actions
    }

    getChildContext() {
      return { [actionsKey]: this[actionsKey] }
    }

    render() {
      return React.Children.only(this.props.children)
    }
  }

  Provider.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line
    children: PropTypes.element.isRequired,
  }

  Provider.childContextTypes = {
    [actionsKey]: PropTypes.object.isRequired,
  }

  return Provider
}

export default createProvider()
