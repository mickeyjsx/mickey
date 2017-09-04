# API

[View this in English](../en-US/API.md)

## 概览

- `createApp(options)`：创建应用，返回 Mickey 实例
- `app.hook(hooks)`：添加应用钩子
- `app.model(model)`：装载模型
- `app.eject(namespace)`：卸载模型
- `app.load(pattern)`：根据 `pattern` 指定的路径加载模型，需要 [babel-plugin-mickey-model-loader](https://github.com/mickeyjsx/babel-plugin-mickey-model-loader) 支持
- `app.render(component, container, callback)`：渲染

## 模块输出

1. 默认输出 `import createApp from 'mickey'` 
2. 原样输出以下模块中的组件和方法，Mickey 负责管理这些依赖模块的[版本](https://github.com/mickeyjsx/mickey/blob/master/package.json#L31)
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

创建应用，返回 Mickey 示例：

```
import createApp from 'mickey'
const app = createApp(options);
```

`options` 包含：
- `historyMode`：指定使用
- `initialState`
- `initialReducer`
- `extensions`
- `hooks`
