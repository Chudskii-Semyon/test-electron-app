import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

let knex = require('knex')({
  client: 'sqlite3', connection: { filename: './tasks.sqlite' }
});

render(
  <AppContainer>
    <Root/>
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot/>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
