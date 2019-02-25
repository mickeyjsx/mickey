// native exports
export { connect } from 'react-redux';
export { applyMiddleware, compose, combineReducers } from 'redux';
export {
  Route,
  Router,
  MemoryRouter,
  StaticRouter,
  Switch,
  Prompt,
  Redirect,
  matchPath,
  withRouter,
} from 'react-router';
export { Link, NavLink, BrowserRouter, HashRouter } from 'react-router-dom';

// mickey exports
import * as utils from './utils';
import * as injectActions from './injectActions';
import * as ActionsProvider from './ActionsProvider';
import createApp from './createApp';

export {
  utils,
  injectActions,
  ActionsProvider,
};

export default createApp;
