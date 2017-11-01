# Mickey

<img src="http://ojh17srjb.bkt.gdipper.com/mickey.svg" alt="mickey.svg" width="160px" align="right">

> Lightweight front-end framework for creating React and Redux based app painlessly.

> Totally base on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/yelouafi/redux-saga) and [react-router](https://github.com/ReactTraining/react-router), very friendly to redux users. 

> (Inspired by [dva](https://github.com/dvajs/dva))

[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/mickeyjsx/mickey/blob/master/LICENSE)

[![NPM Version](https://img.shields.io/npm/v/mickey.svg?style=flat-square)](https://www.npmjs.com/package/mickey)
[![Build Status](https://img.shields.io/travis/mickeyjsx/mickey.svg?style=flat)](https://travis-ci.org/mickeyjsx/mickey)
[![Coverage Status](https://img.shields.io/coveralls/mickeyjsx/mickey.svg?style=flat)](https://coveralls.io/r/mickeyjsx/mickey)
[![NPM downloads](http://img.shields.io/npm/dm/mickey.svg?style=flat)](https://npmjs.org/package/mickey)
[![Dependencies](https://david-dm.org/mickeyjsx/mickey/status.svg)](https://david-dm.org/mickeyjsx/mickey)
[![Package Quality](http://npm.packagequality.com/shield/mickey.svg)](http://packagequality.com/#?package=mickey)

[查看中文](./docs/zh-CN/README.md)

## Features

- **Minimal API** (Only 6 newly introduced). Easy to learn, easy to start
- **No [`diapatch`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#inject-just-dispatch-and-dont-listen-to-store), no [`put`](https://redux-saga.js.org/docs/api/#putaction)**, just forget about [action types](http://redux.js.org/docs/basics/Actions.html)
- **Support loading models dynamically** with [code-splitting](https://webpack.js.org/guides/code-splitting/) to improve performance
- **Support HMR** for components and models with [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader)
- **Full-featured hook mechanism**

## Quick Start

Use [create-react-app](https://github.com/facebookincubator/create-react-app) to create an app:

```shell
$ npm i -g create-react-app
$ create-react-app my-app
```

Then install mickey from npm:

```shell
$ cd my-app
$ npm install mickey --save
$ npm start
```

Update `index.js` as follow:

```jsx
import React from 'react'
import createApp, {connect, injectActions} from 'mickey'

// 1. Initialize
const app = createApp()

// 2. Model
app.model({
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      const delay = timeout => new Promise((resolve) => {
        setTimeout(resolve, timeout)
      })
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
})

// 3. Component
const Comp = (props) => (
  <div>
    <h1>{props.counter.count}</h1>
    <button onClick={() => props.actions.counter.decrement()}>-</button>
    <button onClick={() => props.actions.counter.increment()}>+</button>
    <button onClick={() => props.actions.counter.incrementAsync()}>+ Async</button>
  </div>
)

// 4. Connect state with component and inject `actions`
const App = injectActions(
    connect(state => ({ counter: state.counter })(Comp))
)

// 5. View
app.render(<App />, document.getElementById('root'))
```

## Examples

- [Counter](./examples/counter): Basic usage of mickey
- [Counter-Persist](./examples/counter-persist): Work with [redux-persist](https://github.com/rt2zz/redux-persist)
- [Counter-Immutable](./examples/counter-immutable): Work with [ImmutableJS](https://github.com/facebook/immutable-js/)
- [Counter-Persist-Immutable](./examples/counter-persist-immutable): Work with [redux-persist](https://github.com/rt2zz/redux-persist) and [ImmutableJS](https://github.com/facebook/immutable-js/)
- [Counter-Undo](./examples/counter-undo): Work with [redux-undo](https://github.com/omnidan/redux-undo)
- [Simple-Router](./examples/simple-router): Base on [react-router@4.x](https://reacttraining.com/react-router/)
- [mickey-todo](https://github.com/mickeyjsx/mickey-todo) ([demo](https://mickeyjsx.github.io/todo)): Simple Todo application build with mickey
- [mickey-vstar](https://github.com/mickeyjsx/mickey-vstar) ([demo](http://mickeyjsx.github.io/vstar)): A web app to show your or others GitHub repos stars
- [HackerNews](https://github.com/mickeyjsx/mickey-hackernews) ([demo](http://mickeyjsx.github.io/hackernews)): [HackerNews](https://github.com/vuejs/vue-hackernews-2.0) clone built with mickey

## More

- [API Reference](./docs/en-US/api.md)
- [API 文档](./docs/zh-CN/api.md)
- [mickey.svg](./mickey.svg) badaged in this document is download from [Free Vectors](http://all-free-download.com/free-vector/download/disney-disney-vector_288586.html)


## Related

- [mickey-model-extend](https://github.com/mickeyjsx/mickey-model-extend) Utility method to extend mickey model
- [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) Inject a model loader function to mickey instance with hmr support
- [babel-plugin-mickey-model-validator](https://github.com/mickeyjsx/babel-plugin-mickey-model-validator) Validate models shipped by mickey to avoid certain syntax pitfalls


## Contributing

Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/mickeyjsx/mickey/issues/new).
