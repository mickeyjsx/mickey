# API

[查看中文](../zh-CN/api.md)

## Overview

- [createApp(options)](#createappoptions)
  - [options.historyMode](#optionshistorymode)
  - [options.initialState](#optionsinitialstate)
  - [options.initialReducer](#optionsinitialreducer)
  - [options.hooks](#optionshooks)
    - [options.hooks.onError](#optionshooksonerror)
    - [options.hooks.onAction](#optionshooksonaction)
    - [options.hooks.onEffect](#optionshooksoneffect)
    - [options.hooks.onReducer](#optionshooksonreducer)
    - [options.hooks.onStateChange](#optionshooksonstatechange)
    - [options.hooks.extraReducers](#optionshooksextrareducers)
    - [options.hooks.extraEnhancers](#optionshooksextraenhancers)
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

## Module exports

1. Default export a initialize method: `import createApp from 'mickey'` 
2. Component and method
  - [&lt;ActionsProvider actions&gt;](#actionsprovider-actions)
  - [injectActions({propName = 'actions', withRef = false})](#injectactionspropname--actions-withref--false)
3. Directly export The following components and methods from [dependencies](https://github.com/mickeyjsx/mickey/blob/master/package.json#L31).

- [redux](https://github.com/reactjs/redux)
  - [compose](http://redux.js.org/docs/api/compose.html)
  - [applyMiddleware](http://redux.js.org/docs/api/applyMiddleware.html)
- [react-redux](https://github.com/reactjs/react-redux)
  - [connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)
- [react-router](https://reacttraining.com/react-router/)  
  - [StaticRouter](https://reacttraining.com/react-router/core/api/StaticRouter)
  - [MemoryRouter](https://reacttraining.com/react-router/web/api/MemoryRouter)
  - [Redirect](https://reacttraining.com/react-router/web/api/Redirect)
  - [Prompt](https://reacttraining.com/react-router/core/api/Prompt)
  - [Switch](https://reacttraining.com/react-router/core/api/Switch)
  - [Route](https://reacttraining.com/react-router/core/api/Route)
  - [withRouter](https://reacttraining.com/react-router/core/api/withRouter)
- [react-router-dom](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-dom)  
  - [HashRouter](https://reacttraining.com/react-router/web/api/HashRouter)
  - [BrowserRouter](https://reacttraining.com/react-router/web/api/BrowserRouter)
  - [Link](https://reacttraining.com/react-router/web/api/Link)
  - [NavLink](https://reacttraining.com/react-router/web/api/NavLink)

## API

### createApp(options)


## &lt;ActionsProvider actions&gt;

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
import { connect, injectActions } from 'mickey'
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
