# API

[View this in English](../en-US/api.md)

## 概览

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

## 模块输出

1. 默认输出创建 mickey 实例的方法(如，`createApp`)，`import createApp from 'mickey'` 
2. 组件和方法输出
  - [&lt;ActionsProvider actions&gt;](#actionsprovider-actions)
  - [injectActions({propName = 'actions', withRef = false})](#injectactionspropname--actions-withref--false)
3. 原样输出以下模块中的组件和方法，mickey 负责管理这些依赖模块的[版本](https://github.com/mickeyjsx/mickey/blob/master/package.json#L31)，这样我们在需要使用到这些组件或方法时只需要从 mickey 中 `import` 进来即可，而不需要记住这些组件和方法都分别来自哪个模块。
  
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

### createApp(options)

创建应用，返回 mickey 实例

```
import createApp from 'mickey'
const app = createApp(options);
```

#### options.hooks
- 默认值：`{}`

  配置应用需要使用的插件，详细配置参考 [app.hook(hooks)](#apphookhooks)


#### options.historyMode

- 默认值：`undefined` 表示默认不使用路由
  
  指定 Router 组件所需的 [history](https://github.com/ReactTraining/history#usage) 对象的类型，共有 3 种可选的值：
    - `browser` 标准的 HTML5 hisotry API
    - `hash` 针对不支持 HTML5 history API 的浏览器
    - `memory` history API 的内存实现版本，用于非 DOM 环境
  
  mickey 会根据上面 3 中类型初始化路由系统，如果 `historyMode` 不是上述三种之一则表示不使用路由组件。


#### options.initialState

- 默认值：`{}`

  指定 Redux store 的 [preloadedState](http://redux.js.org/docs/api/createStore.html)。


#### options.initialReducer

- 默认值：`{}`

  指定应用的初始 [reducer](http://redux.js.org/docs/basics/Reducers.html) 函数，将与模型中指定的 `reducer` 一起被 [combine](http://redux.js.org/docs/api/combineReducers.html) 成为 [createStore](http://redux.js.org/docs/api/createStore.html) 需要的 `reducer`。`initialReducer` 结构可以像命名空间那样多层嵌套。


#### options.extensions

- 默认值：`{}`

  应用扩展点，目前支持如下两个扩展：

  ##### `createReducer`
  mickey 默认使用 [redux-actions](https://github.com/reduxactions/redux-actions) 模块提供的 [handleActions](https://redux-actions.js.org/docs/api/handleAction.html) 方法来包装模型中的 `reducer`，可以通过设置 `options.extensions.createReducer` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 示例中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [createReducer](https://github.com/indexiatech/redux-immutablejs#immutable-handler-map-reducer-creator) 方法来替换。

  ##### `combineReducers`

  mickey 默认使用 [redux](https://github.com/reactjs/redux) 提供的 [combineReducers](http://redux.js.org/docs/api/combineReducers.html) 方法将模型中的 `reducer` 连接在一起，可以通过设置 `options.extensions.combineReducers` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 示例中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [combineReducers](https://github.com/indexiatech/redux-immutablejs#initial-state) 方法来替换。




### app.model(model)

装载指定的模型，模型是 mickey 中最重要的概念，一个典型的例子如下：

```js
import { query } from '../services/todo.js'

export default {
  namespace: 'todo',
  state: {
    items: [],
    loading: false,
  },
  load: {
    * effect(payload, { call }, { success, failed }) {
      try {
        const items = yield call(query)
        yield success(items) // 触发成功回调
      } catch (error) {
        yield failed(error)  // 触发失败回调
      }
    },
    prepare: state => ({
      ...state,
      loading: true,
    }),
    success: (state, items) => ({
      ...state,
      items: [...items],
      loading: false,
    }),
    failed: (state, error) => ({
      ...state,
      error,
      loading: false,
    }),
  },
  subscriptions: {
    setup({ history }, innerActions) {
      // 监听 history 变化，当进入 `/` 时触发 `load` action
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          innerActions.load()
        }
      })
    },
  },
}
```

#### model.namespace

指定模型的命名空间，命名空间可以使用 `.` 来划分层级结构，命名空间的层级结构决定了最终 `store` 和 `actions` 的层级结构，如：

```js
app.model({ namespace: 'app.header' })
app.model({ namespace: 'app.content' })
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

虽然可以使用 `.` 来划分 `store` 的层级结构，但**请注意一定不要使 `store` 的结果过于复杂**。

命名空间**不可缺省**，当使用 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 提供的 `app.load(pattern)` 方法来加载模型时会根据模型所在目录结构确定模型的命名空间，此时可以不指定模型的命令空间，看下面的模型的目录结构，通过 `app.load()` 之后将得到与上面相同的结构。

```
.  
└── models
      ├── app
      │   ├── header.js
      │   └── content.js
      └── common.js
```

#### model.state

初始值，优先级低于传给 `createApp()` 的 `options.initialState`。

比如：

```js
const app = createApp({
  initialState: { count: 1 },
});

app.model({
  namespace: 'counter',
  state: 0,
});
```

此时，在 `app.render()` 后 `state.count` 为 1 。

#### model[...actionsAndEffects]

以 `key/value` 格式定义 reducer 和 effect，用于处理同步或异步操作，`key` 表示 action 名称，`value` 分下面四种情况：

- 普通函数：`(state, payload) => newState`

  用于处理同步操作，唯一可以修改 `state` 的地方。

- Generator 函数：`*(payload, effects, callbacks, innerActions, actions) => void`

  用于处理异步操作和业务逻辑，不直接修改 `state`。

- 数组：`[*(payload, effects, callbacks, innerActions, actions) => void, { type } ]`

  处理异步操作和业务逻辑的另一种格式，可以通过 type 指定调用 effect 的方式：

  - `'takeEvery'`
  - `'takeLatest'`
  - `'throttle'`
  - `'watcher'`
  
  当 `type` 为 `'throttle'` 时还需要指定 throttle 的时间间隔：`[*(...) => void, { type, ms } ]`

- 对象

  在继续解释该对象的结构之前，先看一下 mickey 的设计思路。

  对一个异步 action 的处理通常会经历以下几步：
  1. 触发异步请求前修改 `state.loading: true`，使界面中显示一个 loading 图标
  2. 触发异步 action 发起异步接口调用
  3. 对调用成功和失败两种情况处理接口返回，并触发对应的同步 action 来修改 `state` 中的数据

  上面几步组合在一起可以暂且称为“异步处理单元”，如果按上面的思路来设计，那么模型看来像下面这样：

  ```js
  {
    * query(condition, { call }, callbacks, innerActions) {
      try {
        const data = yield call(query)
        yield innerActions.querySuccess(data)
      } catch (error) {
        yield innerActions.queryFailed(error)
      }
    },
    queryPrepare: state => ({ ...state, loading: true }),
    querySuccess: (state, data) => ({ ...state, data, loading: false }),
    queryFailed: (state, error) => ({ ...state, error, loading: false }),
  }
  ```

  对一个异步 action 处理需要 4 个对应的处理函数，而这 4 个处理函数的相关性极强，分开来写看起来并没有那么优雅，所有 mickey 提供了更加“模块化”的形式：

  ```js
  {
    query: {
      * effect(condition, { call }, callbacks) {
        try {
          const data = yield call(query)
          yield callbacks.success(data)
        } catch (error) {
          yield callbacks.failed(error)
        }
      },
      prepare: state => ({ ...state, loading: true }),
      success: (state, data) => ({ ...state, data, loading: false }),
      failed: (state, error) => ({ ...state, error, loading: false }),
    },
  },
  ```

  或者这样：

  ```js
  {
    query: {
      * effect(condition, { call }, {success, failed }) {
        try {
          const data = yield call(query)
          yield success(data)
        } catch (error) {
          yield failed(error)
        }
      },
      prepare: state => ({ ...state, loading: true }),
      success: (state, data) => ({ ...state, data, loading: false }),
      failed: (state, error) => ({ ...state, error, loading: false }),
    },
  },
  ```

  对于一个“异步处理单元”有几点需要强调：
  - 在一个“异步处理单元”中需要**至少包含一个**同步或异步 action 的处理方法
  - `effect` 这个方法名**随意**，在 mickey 内部是通过判断一个函数是否是 Generator 来确定它是不是一个异步处理方法
  - `prepare` 这个方法名必须**固定**，只能这样 mickey 才知道这是一个同步处理方法，并且需要在触发 `query` 这个 action 时同时触发 `prepare`。也就是说，当触发 `query` 这个 action 时 `effect` 和 `prepare` 将被“同时”触发
  - 除 `effect` 和 `prepare` 之外的其他方法都被称为“回调”（callback），回调方法名**随意**，这些方法名将分别以如下形式注入到异步处理函数的参数中：
    - `callbacks` 中以同名的方式注入，如 `success` 和 `failed`；
    - `innerActions` 中将以 `actionName + 驼峰(callback)` 命名注入对应的函数，如 `querySuccess` 和 `queryFiled`
    - `actions` 中注入的方法名与 `innerActions` 一样，不同的是在 `actions` 的方法都需要用完整的命名空间来调用，如 `todo.querySuccess()` 和 `todo.queryFailed()`
  - 所有回调方法的参数签名都一样：`(payload) => void`，如：`success(data)` 或 `innerActions.del(id)`

下面分别看看同步和异步处理方法的方法签名。

处理同步 action：`(state, payload) => newState`：
- `state` 模型原来的数据
- `payload` 对应 [redux](https://github.com/reactjs/redux) 的 [action](http://redux.js.org/docs/basics/Actions.html) 中的 `payload`。在使用 mickey 开发应用时，不再需要关心和维护 `action.type` 这个字符串，所以 mickey 就干脆隐藏了内部维护的 `action.type` 字符串 

处理异步 action：`(payload, sagaEffects, callbacks, innerActions, actions) => void`：

- `payload` 与同步上面提到的同步 action 处理函数中的 `payload` 意义一样
- `sagaEffects` [redux-saga](https://redux-saga.js.org) 中 [effects](https://redux-saga.js.org/docs/api/#effect-creators) 列表 
- `callbacks` 一个"异步处理单元"的回调集合，用于触发该“异步处理单元”中的回调 action
- `innerActions` 本模型所有 action 的集合，用于跨“异步处理单元”触发该模型内部的其他 action
- `actions` 应用所有 action 的集合，通过模型命名空间访问，用于跨模型触发其他模型中的 action


#### model.subscriptions

以 `key/value` 格式定义，用于订阅一个数据源，然后根据需要触发相应的 action。在 `app.render()` 后被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。

格式 `({ history, getState }, innerActions, actions, onError) => unlistenFunction`：

- `history` 根据 `historyMode` 创建的 [history](https://github.com/ReactTraining/history) 实例
- `getState(path, defaultValue)` 调用该方法可以获取 `store` 中的数据，参数意义参考 [lodash.get](https://lodash.com/docs/4.17.4#get)
- `innerActions` 本模型所有 action 集合，用于触发该模型内部的 action
- `actions` 应用所有 action 的集合，通过模型命名空间访问，用于跨模型触发其他模型中的 action

注意：如果要使用 `app.eject()`，subscription 必须返回 unlisten 方法，用于取消数据订阅。


#### model.enhancers

封装模型内部 reducer 执行。例如，在 [Counter-Persist](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-persist) 示例中，需要在模型中手动处理 rehydrate 过程：

```es6
import { REHYDRATE } from 'redux-persist/constants'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

export default {
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  enhancers: [
    reducer => (state, action) => {
      const { type, payload } = action
      if (type === REHYDRATE) {
        return {
          ...state,
          ...payload.counter,
        }
      }
      return reducer(state, action)
    },
  ],
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
}
```

再如，在 [Counter-Undo](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-undo) 示例中，我们需要对 `counter` 这个模型实现 redo/undo：

```es6
import undoable from 'redux-undo'

const delay = timeout => new Promise((resolve) => {
  setTimeout(resolve, timeout)
})

export default {
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  enhancers: [
    reducer => (state, action) => {
      const undoOpts = {}
      const newState = undoable(reducer, undoOpts)(state, action)
      return { ...newState }
    },
  ],
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
}
```

#### model.createReducer

与 [options.extensions.createReducer](#createreducer) 意义一样，不同的是这里只作用与本模型，一旦指定则具有最高优先级。

### app.eject(namespace)

卸载指定 `namespace` 模型，同时清理 Store 中对应的数据，取消 `subscriptions` 中相关的事件订阅。

### app.has(namespace)

返回指定 `namespace` 模型是否被已经被装载，或判断一个 `namespace` 是否被占用。

### app.load(pattern)

根据 `pattern` 指定的路径加载模型，需要 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 支持，`pattern` 为空表示加载所有模型，否则可以指定一个 [glob 表达式](https://www.npmjs.com/package/minimatch)来加载匹配的模型。

### app.render(component, container, callback)

渲染组件到指定的容器中（HTML元素或元素ID），并提供回调或 [AOP](https://zh.wikipedia.org/zh-hans/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1) 支持；`callback` 是函数时 `(app) => {}` 将在渲染完成之后 `subscriptions` 之前执行；如果 `callback` 是形如下面对象：

```es6
{
  beforeRender(app) { },
  afterRender(app) { },
}
```

`beforeRender` 返回 `false` 或返回的 Promise 被 `reject` 时都不会触发渲染过程；当 `beforeRender` 返回 Promise 被 `resolve` 后触发内部的渲染过程，同时还可以通过 `resolve` 重新指定`component` 和 `container`：

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

### app.hook(hooks)

注册应用插件。`hooks` 包含：

#### hooks.onError

`effect` 执行错误或 `subscription` 通过 `done` 主动抛错时触发，可用于管理全局出错状态。

注意：`subscription` 并没有加 `try...catch`，所以有错误时需通过参数 `done` 主动抛错。例如：

```js
app.model({
  subscriptions: {
    setup({ history }, innerAction, actions, done) {
      done(e);
    },
  },
});
```

如果我们用 antd，那么最简单的全局错误处理可以这么做：

```es6
import { message } from 'antd';
import createApp from 'mickey'

const app = createApp({
  hooks: {
    onError(e) {
      message.error(e.message, /* duration */3);
    },
  },
});
```

#### hooks.onAction

在 action 被 dispatch 时触发，用于注册 redux 中间件。支持函数或函数数组格式。

例如我们要通过 redux-logger 打印日志：

```es6
import createApp from 'mickey'
import createLogger from 'redux-logger';
const app = createApp({
  hooks: {
    onAction: createLogger(opts),
  },
});
```

#### hooks.onEffect

封装 effect 执行。

#### hooks.onReducer

封装 reducer 执行。比如借助 [redux-undo](https://github.com/omnidan/redux-undo) 实现 redo/undo ：

```es6
import createApp from 'mickey'
import undoable from 'redux-undo';
const app = createApp({
  hooks:{
    onReducer: reducer => {
      return (state, action) => {
        return undoable(reducer)(state, action);
      },
    },
  },
});
```

#### hooks.onStateChange

`state` 改变时触发，可用于同步 `state` 到 localStorage，服务器端等。

#### hooks.extraReducers

指定额外的 reducer，比如 [redux-form](https://github.com/erikras/redux-form) 需要指定额外的 `form` reducer：

```es6
import createApp from 'mickey'
import { reducer as formReducer } from 'redux-form'
const app = createApp({
  hooks: {
    extraReducers: {
      form: formReducer,
    },
  },
});
```

与 [options.initialReducer](#optionsinitialreducer) 不一样的是，`extraReducers` 指定的 reducer 不能多层嵌套，必须是简单的 `key/value` 格式。

#### hooks.extraEnhancers

指定额外的 [StoreEnhancer](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer) ，比如在 [Counter-Persist](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-persist) 示例中结合 [redux-persist](https://github.com/rt2zz/redux-persist) 的使用：

```es6
import createApp, { applyMiddleware } from 'mickey'
import { persistStore, autoRehydrate } from 'redux-persist'
import { REHYDRATE } from 'redux-persist/constants'
import createActionBuffer from 'redux-action-buffer'
import App from './App'

const app = createApp({
  hooks: {
    extraEnhancers: [
      // add `autoRehydrate` as an enhancer to your store
      autoRehydrate(),
      // make sure to apply this after autoRehydrate
      applyMiddleware(
        // buffer other reducers before rehydrated
        createActionBuffer(REHYDRATE),
      ),
    ],
  },
})
app.model(require('./models/counter.js'))
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

## &lt;ActionsProvider actions&gt;

使 `app.actions` 可以被 `injectActions` 方法注入到子组件中。该组件在 mickey 内部的渲染过程中被使用，并不会在实际项目代码中使用。

```
<ActionsProvider actions={app.actions}>
  <App />
</ActionsProvider>
```

## injectActions({propName = 'actions', withRef = false})

将 `actions` 注入到指定的组件属性中，属性名 (propName) 默认为 `actions`，这样在组件中就可以通过 `this.props.actions[path]` 来获取到指定的方法，进而触发对应的 action。当 `withRef = true` 时将保存一个被包裹组件的实例，可以通过 `this.getWrappedInstance()` 来获取到。

例如，[Counter](https://github.com/mickeyjsx/mickey/blob/master/examples/counter) 实例：

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
