import React from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'react-router-redux';
import { Provider as StoreProvider } from 'react-redux';

const Provider = ({ children, app }) => {
  const child = React.Children.only(children);
  return app.history ? (
    <StoreProvider store={app.store}>
      <ConnectedRouter history={app.history} >
        {child}
      </ConnectedRouter>
    </StoreProvider>
  ) : (
    <StoreProvider store={app.store}>
      {child}
    </StoreProvider>
  );
};

Provider.propTypes = {
  children: PropTypes.element.isRequired,
  app: PropTypes.shape({
    store: PropTypes.object,
    history: PropTypes.object,
  }).isRequired,
};

export default Provider;
