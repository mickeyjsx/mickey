# API

[View this in English](../en-US/API.md)

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

## 初始化
