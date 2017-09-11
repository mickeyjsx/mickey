/* eslint-disable react/no-multi-comp */

import { expect } from 'chai'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import TestUtils from 'react-dom/test-utils'
import injectActions from '../../src/injectActions'

describe('injectActions', () => {
  class Passthrough extends React.Component { // eslint-disable-line
    render() {
      return <div /> // eslint-disable-line
    }
  }

  class ProviderMock extends React.Component {
    getChildContext() {
      return { actions: this.props.actions }
    }

    render() {
      return React.Children.only(this.props.children)
    }
  }

  ProviderMock.childContextTypes = {
    actions: PropTypes.object.isRequired,
  }

  ProviderMock.propTypes = {
    actions: PropTypes.object.isRequired, // eslint-disable-line
    children: PropTypes.element.isRequired,
  }

  it('should receive the store in the context', () => {
    const actions = { foo: 1 }

    @injectActions
    class Container extends React.Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock actions={actions}>
        <Container pass="through" />
      </ProviderMock>,
    )

    const container = TestUtils.findRenderedComponentWithType(tree, Container)
    expect(container.context.actions).to.be.eql(actions)
  })

  it('should pass actions and props to the given component', () => {
    const actions = {
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }

    @injectActions
    class Container extends React.Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const container = TestUtils.renderIntoDocument(
      <ProviderMock actions={actions}>
        <Container pass="through" baz={50} />
      </ProviderMock>,
    )
    const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
    expect(stub.props.actions).to.be.eql(actions)
    expect(stub.props.baz).to.equal(50)
    expect(stub.props.hello).to.be.undefined // eslint-disable-line

    expect(() =>
      TestUtils.findRenderedComponentWithType(container, Container),
    ).to.not.throw()
  })

  it('should throw an error if a component is not passed to injectActions', () => {
    const WrappedComponent = injectActions()
    const render = () => { ReactDOM.render(<WrappedComponent />, React.createElement('div')) }
    expect(render).to.throw()
  })

  it('should throw when trying to access the wrapped instance if withRef is not specified', () => {
    const actions = {}

    class Container extends React.Component { // eslint-disable-line
      render() {
        return <Passthrough />
      }
    }

    const Decorated = injectActions(Container)
    const tree = TestUtils.renderIntoDocument(
      <ProviderMock actions={actions}>
        <Decorated />
      </ProviderMock>,
    )

    const decorated = TestUtils.findRenderedComponentWithType(tree, Decorated)
    expect(() => decorated.getWrappedInstance()).to.throw(
      /To access the wrapped instance, you need to specify \{ withRef: true \} in the options argument of the injectActions\(\) call\./,
    )
  })

  it('should return the instance of the wrapped component for use in calling child methods', () => {
    const actions = {}

    const someData = {
      some: 'data',
    }

    class Container extends React.Component {
      someInstanceMethod() { // eslint-disable-line
        return someData
      }

      render() {
        return <Passthrough />
      }
    }

    const Decorated = injectActions(Container, { withRef: true })
    const tree = TestUtils.renderIntoDocument(
      <ProviderMock actions={actions}>
        <Decorated />
      </ProviderMock>,
    )

    const decorated = TestUtils.findRenderedComponentWithType(tree, Decorated)
    expect(() => decorated.someInstanceMethod()).to.throw()
    expect(decorated.getWrappedInstance().someInstanceMethod()).to.be.eql(someData)
    expect(decorated.wrappedInstance.someInstanceMethod()).to.be.eql(someData)
  })
})
