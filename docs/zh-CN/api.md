# API

[View this in English](../en-US/api.md)

## 概览

- [`createApp(options)`](#createappoptions)
  - [`options.hooks`]()
  - [`options.historyMode`]()
  - [`options.initialState`]()
  - [`options.initialReducer`]()
  - [`options.extensions`]()
- [`app.hook(hooks)`](#apphookhooks)
  - [`hooks.onError`]()
  - [`hooks.onAction`]()
  - [`hooks.onEffect`]()
  - [`hooks.onReducer`]()
  - [`hooks.onStateChange`]()
  - [`hooks.extraReducers`]()
  - [`hooks.extraEnhancers`]()
- [`app.model(model)`](#appmodelmodel)
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

`options` 包含：
- [`hooks`]()
- [`historyMode`]()
- [`initialState`]()
- [`initialReducer`]()
- [`extensions`]()

#### * `options.hooks`
- 默认值：`{}`
  配置应用的插件


#### * `options.historyMode`
- 默认值：`undefined`
  
  表示 Router 组件所需的 [history](https://github.com/ReactTraining/history#usage) 对象的类型，共有 3 种可选的值：
   - `browser` 标准的 HTML5 hisotry API
   - `hash` 针对不支持 HTML5 history API 的浏览器
   - `memory` history API 的内存实现版本，用于非 DOM 环境

#### * `options.initialState`

表示 Redux store 的 [preloadedState](http://redux.js.org/docs/api/createStore.html)

- 默认值：`{}`
  
#### * `options.initialReducer`
#### * `options.extensions`


### `app.hook(hooks)`
添加应用插件
### `app.model(model)`
装载模型
### `app.eject(namespace)`
卸载指定 namespace 模型
### `app.has(namespace)`
返回指定 namespace 模型是否被已经被装载
### `app.load(pattern)`
根据 pattern 指定的路径加载模型，需要 babel-plugin-mickey-model-loader 支持
### `app.render(component, container, callback)`
渲染组件到指定的容器中，并提供回调支持
