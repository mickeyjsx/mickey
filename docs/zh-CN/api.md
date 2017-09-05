# API

[View this in English](../en-US/api.md)

## 概览

- [`createApp(options)`](#createappoptions)
  - [`options.hooks`]()
  - [`options.historyMode`]()
  - [`options.initialState`]()
  - [`options.initialReducer`]()
  - [`options.extensions`]()
    - [`options.extensions.createReducer`]()
    - [`options.extensions.combineReducers`]()
- [`app.hook(hooks)`](#apphookhooks)
  - [`hooks.onError`]()
  - [`hooks.onAction`]()
  - [`hooks.onEffect`]()
  - [`hooks.onReducer`]()
  - [`hooks.onStateChange`]()
  - [`hooks.extraReducers`]()
  - [`hooks.extraEnhancers`]()
- [`app.model(model)`](#appmodelmodel)
  - [`model.namespace`]()
  - [`model.state`]()
  - [`model.actions`]()
  - [`model.effects`]()
  - [`model.subscriptions`]()
  - [`model.createReducer`]()
  - [`model[...groups]`]()
- [`app.eject(namespace)`](#appejectnamespace)
- [`app.has(namespace)`](#apphasnamespace)
- [`app.load(pattern)`](#apploadpattern)
- [`app.render(component, container, callback)`](#apprendercomponent-container-callback)

## 模块输出

1. 默认输出 `import createApp from 'mickey'` 
2. 原样输出以下模块中的组件和方法，Mickey 负责管理这些依赖模块的[版本](https://github.com/mickeyjsx/mickey/blob/master/package.json#L31)，这样我们在需要使用到这些组件或方法时只需要从 Mickey 中 `import` 进来即可，而不需要记住这些组件和方法都是来自哪里
  
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

## API详解

### `createApp(options)` 

创建应用，返回 Mickey 实例：

```
import createApp from 'mickey'
const app = createApp(options);
```

#### `options.hooks`
- 默认值：`{}`

  配置应用需要使用的插件，详细配置参考 [`app.hook(hooks)`](#apphookhooks)

#### `options.historyMode`
- 默认值：`undefined`
  
  指定 Router 组件所需的 [history](https://github.com/ReactTraining/history#usage) 对象的类型，共有 3 种可选的值：
    - `browser` 标准的 HTML5 hisotry API
    - `hash` 针对不支持 HTML5 history API 的浏览器
    - `memory` history API 的内存实现版本，用于非 DOM 环境
  
  Mickey 会根据上面 3 中类型初始化路由系统，如果 `historyMode` 不是上述三种之一则表示不使用路由组件。
  
  默认值为 `undefined` 表示默认不使用路由。

#### `options.initialState`
- 默认值：`{}`

  指定 Redux store 的 [preloadedState](http://redux.js.org/docs/api/createStore.html)
  
#### `options.initialReducer`
- 默认值：`{}`

  指定应用的初始 [`reducer`](http://redux.js.org/docs/basics/Reducers.html) 函数，将与模型中指定的 `reducer` 一起被 [`combine`](http://redux.js.org/docs/api/combineReducers.html) 成为 [`createStore`](http://redux.js.org/docs/api/createStore.html) 需要的 `reducer`  

#### `options.extensions`
- 默认值：`{}`

  应用扩展点，目前支持如下两个扩展：

##### `createReducer`

Mickey 默认使用 [redux-actions](https://github.com/reduxactions/redux-actions) 模块提供的 [`handleActions`](https://redux-actions.js.org/docs/api/handleAction.html) 方法来包装模型中的 `reducer`，可以通过设置 `options.extensions.createReducer` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [`createReducer`](https://github.com/indexiatech/redux-immutablejs#immutable-handler-map-reducer-creator) 方法来替换。

##### `combineReducers`

Mickey 默认使用 [redux](https://github.com/reactjs/redux) 提供的 [`combineReducers`](http://redux.js.org/docs/api/combineReducers.html) 方法将模型中的 `reducer` 连接在一起，可以通过设置 `options.extensions.combineReducers` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [`combineReducers`](https://github.com/indexiatech/redux-immutablejs#initial-state) 方法来替换

### `app.hook(hooks)`

注册应用插件。

### `app.model(model)`

装载指定的模型，模型的结构分解如下：

#### `model.namespace` 

指定模型的命名空间，命名空间可以使用 `/` 来划分层级结构，命名空间的层级结构决定了最终 `store` 和 `actions` 的层级结构，如：

```js
app.model({ namespace: 'app/header' })
app.model({ namespace: 'app/content' })
app.model({ namespace: 'common' })
```

那么得到的 `store` 和 `actions` 结构如下：

```
store/actions
    ├── app
    │   ├── header
    │   └── content
    └── common
```

虽然可以使用 `/` 来划分 `store` 的层级结构，但**请注意一定不要使 `store` 的结果过于复杂**。

命名空间**不可缺省**，当使用 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 提供的 `app.load(pattern)` 方法来加载模型时会根据模型所在目录结构确定模型的命名空间，此时可以不指定模型的命令空间，看下面的三个模型的目录结构，将得到与上面相同的结构。

```
.  
└── models
      ├── app
      │   ├── header.js
      │   └── content.js
      └── common.js
```

#### `model.state`
#### `model.actions`
#### `model.effects`
#### `model.subscriptions`
#### `model.createReducer`
#### `model[...groups]`

### `app.eject(namespace)`

卸载指定 `namespace` 模型，同时清理 Store 中对应的数据，取消 `subscriptions` 中相关的事件订阅。

### `app.has(namespace)`

返回指定 `namespace` 模型是否被已经被装载，或判断一个 `namespace` 是否被占用。

### `app.load(pattern)`

根据 `pattern` 指定的路径加载模型，需要 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 支持，`pattern` 为空表示加载所有模型，否则可以指定一个 [glob 表达式](https://www.npmjs.com/package/minimatch)来加载匹配的模型。

### `app.render(component, container, callback)`

渲染组件到指定的容器中，并提供回调或 [AOP](https://zh.wikipedia.org/zh-hans/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1) 支持；`callback` 是函数时 `(app) => {}` 将在渲染完成之后 `subscriptions` 之前执行；如果 `callback` 是形如下面对象：

```es6
{
  beforeRender(app) { },
  afterRender(app) { },
}
```

`beforeRender` 返回 `false` 或返回的 Promise 被 `reject` 时都不会触发渲染过程；当 `beforeRender` 返回 Promise 被 `resolve` 后触发内部的渲染过程，同时还可以通过 `resolve` 重新指定`component` 和 `container`：

```
app.render(component, container, {
  beforeRender(app) { 
    return new Promise((resolve) => {
      resolve([newComponent, newContainer]);
    })
  }
})
```

返回一个 Promise 非常实用，如在 [Counter-Persist](./examples/counter-persist) 实例中，需要等 rehydrate 完成之后才触发实际的渲染过程：

```
app.render(<App />, document.getElementById('root'), {
  beforeRender: ({ store }) => new Promise(((resolve) => {
    // begin periodically persisting the store
    persistStore(store, {
      debounce: 500,
      whitelist: ['counter'],
      keyPrefix: 'mickey:',
    }, () => {
      resolve() // delay render after rehydrated
    })
  })),
})
```
