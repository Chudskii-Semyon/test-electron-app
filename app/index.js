import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { loremIpsum } from 'lorem-ipsum';
import { randomDate } from './helpers';

let knex = require('knex')({
  client: 'sqlite3', connection: { filename: './tasks.sqlite' }
});

const tasks = [];

for (let i = 0; i < 400; i++) {
  tasks.push({
    title: loremIpsum({ count: 5, units: 'words' }),
    created_at: randomDate(new Date(2000, 0, 1), new Date())
  });
}

knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    return knex.schema.createTable('tasks', (table) => {
      table.increments('id');
      table.string('title');
      table.timestamp('created_at');
    })
      .then(() => {
        knex.insert(tasks).into('tasks')
          .then(() => {
            render(
              <AppContainer>
                <Root/>
              </AppContainer>,
              document.getElementById('root')
            );
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log('Error = ', err));
  } else {
    render(
      <AppContainer>
        <Root/>
      </AppContainer>,
      document.getElementById('root')
    );
  }
});


// if (module.hot) {
//   module.hot.accept('./containers/Root', () => {
//     // eslint-disable-next-line global-require
//     const NextRoot = require('./containers/Root').default;
//     render(
//       <AppContainer>
//         <NextRoot/>
//       </AppContainer>,
//       document.getElementById('root')
//     );
//   });
// }
