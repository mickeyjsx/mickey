# API

[View this in English](../en-US/api.md)

## 概览

- [createApp(options)](#createappoptions)
  - [options.hooks]()
  - [options.historyMode]()
  - [options.initialState]()
  - [options.initialReducer]()
  - [options.extensions]()
    - [options.extensions.createReducer]()
    - [options.extensions.combineReducers]()
- [app.hook(hooks)](#apphookhooks)
  - [hooks.onError]()
  - [hooks.onAction]()
  - [hooks.onEffect]()
  - [hooks.onReducer]()
  - [hooks.onStateChange]()
  - [hooks.extraReducers]()
  - [hooks.extraEnhancers]()
- [app.model(model)](#appmodelmodel)
  - [model.namespace]()
  - [model.state]()
  - [model.subscriptions]()
  - [model.enhancers]()
  - [model.createReducer]()
  - [model[...actionsAndEffects]]()
- [app.eject(namespace)](#appejectnamespace)
- [app.has(namespace)](#apphasnamespace)
- [app.load(pattern)](#apploadpattern)
- [app.render(component, container, callback)](#apprendercomponent-container-callback)

## 模块输出

1. 默认输出 `import createApp from 'mickey'` 
2. 原样输出以下模块中的组件和方法，mickey 负责管理这些依赖模块的[版本](https://github.com/mickeyjsx/mickey/blob/master/package.json#L31)，这样我们在需要使用到这些组件或方法时只需要从 mickey 中 `import` 进来即可，而不需要记住这些组件和方法都分别来自哪个模块。
  
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

创建应用，返回 mickey 实例：

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

  指定应用的初始 [reducer](http://redux.js.org/docs/basics/Reducers.html) 函数，将与模型中指定的 `reducer` 一起被 [combine](http://redux.js.org/docs/api/combineReducers.html) 成为 [createStore](http://redux.js.org/docs/api/createStore.html) 需要的 `reducer`。 


#### options.extensions

- 默认值：`{}`

  应用扩展点，目前支持如下两个扩展：

  ##### `createReducer`
  mickey 默认使用 [redux-actions](https://github.com/reduxactions/redux-actions) 模块提供的 [handleActions](https://redux-actions.js.org/docs/api/handleAction.html) 方法来包装模型中的 `reducer`，可以通过设置 `options.extensions.createReducer` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [createReducer](https://github.com/indexiatech/redux-immutablejs#immutable-handler-map-reducer-creator) 方法来替换。

  ##### `combineReducers`

  mickey 默认使用 [redux](https://github.com/reactjs/redux) 提供的 [combineReducers](http://redux.js.org/docs/api/combineReducers.html) 方法将模型中的 `reducer` 连接在一起，可以通过设置 `options.extensions.combineReducers` 来替换默认实现。例如，在 [Counter-Immutable](../../examples/counter-immutable) 中需要使用 [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) 模块提供的 [combineReducers](https://github.com/indexiatech/redux-immutablejs#initial-state) 方法来替换。


### app.hook(hooks)

注册应用插件。

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

虽然可以使用 `/` 来划分 `store` 的层级结构，但**请注意一定不要使 `store` 的结果过于复杂**。

命名空间**不可缺省**，当使用 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 提供的 `app.load(pattern)` 方法来加载模型时会根据模型所在目录结构确定模型的命名空间，此时可以不指定模型的命令空间，看下面的三个模型的目录结构，将得到与上面相同的结构。

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

#### model.subscriptions

以 key/value 格式定义 subscription。subscription 是订阅，用于订阅一个数据源，然后根据需要触发相应的 action。在 `app.render()` 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。

格式为 `({ dispatch }, innerActions, actions, done) => unlistenFunction`。

注意：如果要使用 `app.eject()`，subscription 必须返回 unlisten 方法，用于取消数据订阅。

#### model.enhancers

#### model.createReducer

#### model[...actionsAndEffects]

以 `key/value` 格式定义 reducer 和 effect，用于处理同步或异步操作，`key` 表示 action 名称，`value` 分下面四种情况：

- `value` 是一个普通函数

  格式：`(state, payload) => newState`

  用于处理同步操作，唯一可以修改 `state` 的地方。

- `value` 是一个 Generator 函数

  格式：`*(payload, effects, callbacks, innerActions, actions) => void`

  用于处理异步操作和业务逻辑，不直接修改 `state`。

- `value` 是一个数组

  格式：`[*(payload, effects, callbacks, innerActions, actions) => void, { type } ]`

  处理异步操作和业务逻辑的另一种格式，可以通过 type 指定调用 effect 的方式：

  - `'takeEvery'`
  - `'takeLatest'`
  - `'throttle'`
  - `'watcher'`
  

  当 `type` 为 `'throttle'` 时还需要指定 throttle 的时间间隔：`[*(...) => void, { type, ms } ]`

- `value` 是一个对象，可以成为一个“异步处理单元”

  用于处理一组操作，这一组操作中至少应该包含一个同步或异步 action。例如，对于一个最常见的 query action，我们通常会经历如下几步：
  1. query 之前修改 `state.loading: true`，使界面中显示一个 loading 图标
  2. 触发异步 action 发起异步接口调用
  3. 分调用成功和失败两种情况处理接口返回，并触发对应的同步 action 来修改 `state` 中的数据

  如果分开来设计，那么 model 可能看来像下面这样：

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

  需要分别触发 `query` 和 `queryPrepare` 两个 action，同时这 4 个 action 的相关性极强，分开来写看起来并没有那么优雅，所有我们提供了“异步处理单元”的形式：

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

  这里有几点需要强调：
  - `effect` 这个方法名可以随意取，因为在 mickey 内部是通过判断一个函数是否是 Generator 来确定它是不是一个异步处理方法
  - `prepare` 这个方法名必须**固定**，只能这样 mickey 才知道这是一个同步处理方法，并且需要在触发 `query` 这个 action 时同时触发 `prepare`。也就是说，当触发 `query` 这个 action 时 `effect` 和 `prepare` 将“同时”被触发
  - 除 `effect` 和 `prepare` 之外的其他方法都被称为“回调”（callback），这些回调函数的函数名将分别以如下形式注入到异步处理函数的参数中：
    - `callbacks` 中将注入同名的函数；
    - `innerActions` 中将以 `actionName + 驼峰(callback)` 函数名注入对应的函数，如 `querySuccess` 和 `queryFiled`
    - `actions` 中注入的函数名与 `innerActions` 一样，不同的是在 `actions` 的函数都需要用完整的命名空间来调用，如 `todo.querySuccess()` 和 `todo.queryFailed()`

下面分别看看同步和异步处理函数参数的意义。

同步 action 处理函数 `(state, payload) => newState`：
- `state` 模型原来的数据
- `payload` 对应 [redux](https://github.com/reactjs/redux) 的 [action](http://redux.js.org/docs/basics/Actions.html) 中的 `payload`。在使用 mickey 开发应用时，不再需要关心和维护 `action.type` 这个字符串，所以 mickey 就干脆隐藏了内部维护的 `action.type` 字符串 

异步 action 处理函数 `(payload, sagaEffects, callbacks, innerActions, actions) => void`：

- `payload` 与同步上面提到的同步 action 处理函数中的 `payload` 意义一样
- `sagaEffects` 就是 [redux-saga](https://redux-saga.js.org) 中 [effects](https://redux-saga.js.org/docs/api/#effect-creators) 列表 
- `callbacks` 一个异步处理单元中的回调集合，用于触发该异步单元中的同步回调 action
- `innerActions` 本 model 所有 action 的集合，用于触发 model 内部的其他 action
- `actions` 本应用所以 action 的集合，通过 model 的命名空间访问，用于跨 model 触发其他 model 的 action


### app.eject(namespace)

卸载指定 `namespace` 模型，同时清理 Store 中对应的数据，取消 `subscriptions` 中相关的事件订阅。

### app.has(namespace)

返回指定 `namespace` 模型是否被已经被装载，或判断一个 `namespace` 是否被占用。

### app.load(pattern)

根据 `pattern` 指定的路径加载模型，需要 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 支持，`pattern` 为空表示加载所有模型，否则可以指定一个 [glob 表达式](https://www.npmjs.com/package/minimatch)来加载匹配的模型。

### app.render(component, container, callback)

渲染组件到指定的容器中，并提供回调或 [AOP](https://zh.wikipedia.org/zh-hans/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1) 支持；`callback` 是函数时 `(app) => {}` 将在渲染完成之后 `subscriptions` 之前执行；如果 `callback` 是形如下面对象：

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
