# Mickey

> 一款轻量、高效、易上手的前端框架，无痛开发基于 React 和 Redux 的 APP

> 完全基于 [redux](https://github.com/reactjs/redux)，[redux-saga](https://github.com/yelouafi/redux-saga) 和 [react-router](https://github.com/ReactTraining/react-router)，对 Redux 用户极其友好 (Inspired by [dva](https://github.com/dvajs/dva))

<img src="http://ojh17srjb.bkt.gdipper.com/mickey.svg" alt="mickey.svg" width="160px">

[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/mickey/mickey/blob/master/LICENSE)

[![NPM Version](https://img.shields.io/npm/v/mickey.svg?style=flat-square)](https://www.npmjs.com/package/mickey)
[![Build Status](https://img.shields.io/travis/mickeyjsx/mickey.svg?style=flat)](https://travis-ci.org/mickeyjsx/mickey)
[![Coverage Status](https://img.shields.io/coveralls/mickeyjsx/mickey.svg?style=flat)](https://coveralls.io/r/mickeyjsx/mickey)
[![NPM downloads](http://img.shields.io/npm/dm/mickey.svg?style=flat)](https://npmjs.org/package/mickey)
[![Dependencies](https://david-dm.org/mickey/mickey/status.svg)](https://david-dm.org/mickey/mickey)
[![Package Quality](http://npm.packagequality.com/shield/mickey.svg)](http://packagequality.com/#?package=mickey)

[View README in English](../../README.md)

## 特性

- **最小化API**：只有 5 个新方法，易学易用
- **使用 Elm 概念**：通过 `reducers`，`effects` 和 `subscriptions` 来组织 model
- **支持动态加载**：结合 [code-splitting](https://webpack.js.org/guides/code-splitting/) 可以实现路由和模型动态加载
- **支持 HMR**：集合 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 实现组件和 model 热替换
- **完备的插件机制**

## 快速开始

使用 [create-react-app](https://github.com/facebookincubator/create-react-app) 创建一个新的 app：

```shell
$ npm i -g create-react-app
$ create-react-app my-app
```

然后安装 mickey：

```shell
$ cd my-app
$ npm install mickey --save
$ npm start
```

修改项目中的 `index.js`：

```jsx
import React from 'react'
import createApp from 'mickey'

// 1. Initialize
const app = createApp()

// 2. Model
app.model({
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  reducers: {
    increment: state => ({ ...state, count: state.count + 1 }),
    decrement: state => ({ ...state, count: state.count - 1 }),
  },
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

// 3. View
app.render(<App />, document.getElementById('root'))
```

## 示例

- [Counter](../../examples/counter) 简单的计数器
- [Counter-Persist](../../examples/counter-persist) 搭配 [redux-persist](https://github.com/rt2zz/redux-persist) 使用
- [Counter-Immutable](../../examples/counter-immutable) 搭配 [ImmutableJS](https://github.com/facebook/immutable-js/) 使用
- [Counter-Persist-Immutable](../../examples/counter-persist-immutable) 搭配 [redux-persist](https://github.com/rt2zz/redux-persist) 和 [ImmutableJS](https://github.com/facebook/immutable-js/) 使用
- [Counter-Undo](../../examples/counter-undo) 搭配 [redux-undo](https://github.com/omnidan/redux-undo) 使用
- [mickey-vstar](https://github.com/mickeyjsx/mickey-vstar) ([demo](http://mickeyjsx.github.io/vstar)) 查询指定 Github 账号中被加星项目并按加星数排序
- [HackerNews](https://github.com/mickeyjsx/mickey-hackernews) ([demo](http://mickeyjsx.github.io/hackernews)) 基于 mickey 实现的 HackerNews

## 了解更多

- [API 文档](./API.md)
- [mickey.svg](../../mickey.svg) 下载自 [Free Vectors](http://all-free-download.com/free-vector/download/disney-disney-vector_288586.html)

## 贡献代码

非常欢迎给我们提 MR，如果你喜欢我们的代码请在右上角加星。

发现任何 BUG 和使用问题请给我们[提 ISSUE](https://github.com/mickey/mickey/issues/new)。
