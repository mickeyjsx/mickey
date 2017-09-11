/* eslint-disable react/no-multi-comp */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prefer-stateless-function */

import { expect } from 'chai'
import sinon from 'sinon'
import React from 'react'
import PropTypes from 'prop-types'
import TestUtils from 'react-dom/test-utils'
import ActionsProvider, { createProvider } from '../../src/ActionsProvider'

describe('ActionsProvider', () => {
  const createChild = (actionsKey = 'actions') => {
    class Child extends React.Component {
      render() {
        return <div />
      }
    }

    Child.contextTypes = {
      [actionsKey]: PropTypes.object.isRequired,
    }

    return Child
  }

  const Child = createChild()

  it('should enforce a single child', () => {
    const actions = {}

    // Ignore propTypes warnings
    const propTypes = ActionsProvider.propTypes
    ActionsProvider.propTypes = {}

    try {
      expect(
        () => TestUtils.renderIntoDocument(
          <ActionsProvider actions={actions}>
            <div />
          </ActionsProvider>,
        ),
      ).to.not.throw()

      expect(
        () => TestUtils.renderIntoDocument(
          <ActionsProvider store={actions} />,
        ),
      ).to.throw(/a single React element child/)

      expect(
        () => TestUtils.renderIntoDocument(
          <ActionsProvider store={actions}>
            <div />
            <div />
          </ActionsProvider>,
        ),
      ).to.throw(/a single React element child/)
    } finally {
      ActionsProvider.propTypes = propTypes
    }
  })

  it('should add the actions to the child context', () => {
    const actions = { foo: 1 }
    const spy = sinon.spy(console, 'error')
    const tree = TestUtils.renderIntoDocument(
      <ActionsProvider actions={actions}>
        <Child />
      </ActionsProvider>,
    )
    spy.restore()
    expect(spy.callCount).to.be.equal(0)

    const child = TestUtils.findRenderedComponentWithType(tree, Child)
    expect(child.context.actions).to.be.eql(actions)
  })

  it('should add the actions to the child context using a custom actions key', () => {
    const actions = { foo: 1 }
    const CustomProvider = createProvider('customActionsKey')
    const CustomChild = createChild('customActionsKey')

    const spy = sinon.spy(console, 'error')
    const tree = TestUtils.renderIntoDocument(
      <CustomProvider actions={actions}>
        <CustomChild />
      </CustomProvider>,
    )
    spy.restore()
    expect(spy.callCount).to.be.equal(0)

    const child = TestUtils.findRenderedComponentWithType(tree, CustomChild)
    expect(child.context.customActionsKey).to.be.eql(actions)
  })
})
