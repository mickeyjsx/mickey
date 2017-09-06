# API

[查看中文](../zh-CN/api.md)

## Overview

- [createApp(options)](#createappoptions)
  - [options.hooks](#optionshooks)
  - [options.historyMode](#optionshistorymode)
  - [options.initialState](#optionsinitialstate)
  - [options.initialReducer](#optionsinitialreducer)
  - [options.extensions](#optionsextensions)
    - [options.extensions.createReducer](#createreducer)
    - [options.extensions.combineReducers](#combinereducers)
- [app.model(model)](#appmodelmodel)
  - [model.namespace](#modelnamespace)
  - [model.state](#modelstate)
  - [model.subscriptions](#modelsubscriptions)
  - [model.enhancers](#modelenhancers)
  - [model.createReducer](#modelcreatereducer)
  - [model[...actionsAndEffects]](#modelactionsandeffects)
- [app.eject(namespace)](#appejectnamespace)
- [app.has(namespace)](#apphasnamespace)
- [app.load(pattern)](#apploadpattern)
- [app.render(component, container, callback)](#apprendercomponent-container-callback)
- [app.hook(hooks)](#apphookhooks)
  - [hooks.onError](#hooksonerror)
  - [hooks.onAction](#hooksonaction)
  - [hooks.onEffect](#hooksoneffect)
  - [hooks.onReducer](#hooksonreducer)
  - [hooks.onStateChange](#hooksonstatechange)
  - [hooks.extraReducers](#hooksextrareducers)
  - [hooks.extraEnhancers](#hooksextraenhancers)

## Module export


## <ActionsProvider actions>

Makes the `actions` available to the `injectActions()` calls in the component hierarchy below. It was used in the `render` call,  like this:

```
<ActionsProvider actions={app.actions}>
  <App />
</ActionsProvider>
```

## injectActions({propName = 'actions', withRef = false})

Inject `actions` to a React component. By default the propName would be `actions`. If `withRef` is true, stores a ref to the wrapped component instance and makes it available via getWrappedInstance() method.

For example, [Counter](https://github.com/mickeyjsx/mickey/blob/master/examples/counter)：

```jsx
import React from 'react'
import { actions, connect, injectActions } from 'mickey'
import './App.css'

const App = props => (
  <div id="counter-app">
    <h1>{props.count}</h1>
    <div className="btn-wrap">
      <button onClick={() => props.actions.counter.decrement()}>-</button>
      <button onClick={() => props.actions.counter.increment()}>+</button>
      <button
        style={{ width: 100 }}
        onClick={() => {
          if (props.loading) {
            alert('loading') // eslint-disable-line
          } else {
            props.actions.counter.incrementAsync()
          }
        }}
      >
        {props.loading ? 'loading' : '+ Async'}
      </button>
    </div>
  </div>
)

export default injectActions(connect(store => ({ ...store.counter }))(App))
```
