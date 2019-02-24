import React from 'react'
import PropTypes from 'prop-types'

type Props = {
  actions: any; // TODO: any
}

// * 渲染 children，但是把 actions 存在这个 Provider 组件中，并放到 context 里
export function createProvider() { // TODO: support custom actionsKey
  class Provider extends React.Component<Props> {
    static childContextTypes = PropTypes.object.isRequired;
    actions: Props['actions'];
    constructor(props: Props, context: any) { // TODO: context
      super(props, context);
      this.actions = props.actions;
    }

    getChildContext() {
      return { actions: this.actions };
    }

    render() {
      return React.Children.only(this.props.children);
    }
  }

  return Provider as any; // TODO: any
}

export default createProvider();
