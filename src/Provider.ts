import warning from 'warning';
import React, { createElement } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { ConnectedRouter, routerActions } from 'connected-react-router';
import ActionsProvider from './ActionsProvider';
import { App } from './createApp';
import { ActionDispatcherMap } from './actions';


interface Props {
  app: App;
}
// * 接收参数见下方的 propTypes
export default class Provider extends React.Component<Props> {
    addRouterActions() {
    const { app } = this.props;
    if (app.history) {
      // * Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.router,
      // when called, will dispatch the crresponding action provided by connected-react-router.
      app.actions.router = Object.entries(routerActions).reduce((accum: ActionDispatcherMap, [key, actionCreator]) => ({
        ...accum,
        [key]: (...args: any) => {
          return app.store.dispatch((actionCreator as any)(...args));
        },
      }), {});

      app.actions.routing = Object.entries(routerActions).reduce((accum: ActionDispatcherMap, [key, actionCreator]) => ({
        ...accum,
        [key]: (...args: any) => {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              '\'app.actions.routing\' is deprecated, use \'app.actions.router\' instead.',
            );
          }
          return app.store.dispatch((actionCreator as any)(...args));
        },
      }), {});
    }
  }

  renderProvider(Component: React.ReactNode): React.ReactNode {
    const { app } = this.props;

    return createElement(
      ActionsProvider,
      { actions: app.actions },
      createElement(
        StoreProvider,
        { store: app.store },
        Component,
      ),
    );
  }

  render(): React.ReactNode {
    const { children, app } = this.props;
    const child = React.Children.only(children);
    this.addRouterActions();
    return this.renderProvider(
      app.history
        ? createElement(ConnectedRouter, { history: app.history }, child)
        : child,
    );
  }
};
