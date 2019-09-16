// @flow
import React, { Component } from 'react';
import { format } from 'date-fns';
import classes from './Root.modules.css';
import { scroll } from '../helpers';

const knex = require('knex')({
  client: 'sqlite3', connection: { filename: './tasks.sqlite' }
});

let tasksDiv: $ElementType<HTMLDivElement> | null = null;
const memoizedSize: number = 60;
const fetchLimit: number = 20;
let maxTasks: number = 400;

type Task = {
  id: number,
  title: string,
  created_at: Date
};

type Props = {};

type State = {
  tasks: Array<Task>
};

class Root extends Component<Props, State> {
  state = {
    tasks: []
  };

  fetchTasks = (): void => {
    const { tasks } = this.state;

    if (tasks.length) {
      if (tasks.length < memoizedSize) {
        knex('tasks').where('created_at', '<', tasks[tasks.length - 1].created_at)
          .limit(fetchLimit)
          .orderBy('created_at', 'desc')
          .then((res: Array<Task>) => {
            this.setState({ tasks: [...tasks, ...res] });
          });

      } else {
        knex('tasks').where('created_at', '<', tasks[tasks.length - 1].created_at)
          .limit(fetchLimit)
          .orderBy('created_at', 'desc')
          .then((res: Array<Task>) => {

            const slicedTasks: Array<Task> = tasks.slice(fetchLimit, tasks.length);
            const updatedTasks: Array<Task> = [...slicedTasks, ...res];

            this.setState({
              tasks: updatedTasks
            });

            tasksDiv.scrollTop = 1800;
          });
      }
    }
  };

  componentDidMount() {
    tasksDiv = document.getElementById('tasks');
    tasksDiv.addEventListener('scroll', () => scroll(tasksDiv, this.fetchTasks, this.fetchPrevTasks));

    knex('tasks').where({}).limit(fetchLimit).orderBy('created_at', 'desc')
      .then((res: Array<Task>) => {
        this.setState({ tasks: res });
      });
  }

  render() {
    const { tasks } = this.state;

    return (
      <div id="tasks" className={classes.Root}>

        {tasks.length ? tasks.map((task): $ElementType<HTMLParagraphElement> => (
          <p className={classes.Task}
             key={task.id}>{task.id}: {task.title} | {format(task.created_at, 'MM/dd/yyyy')}</p>
        )) : null
        }

      </div>
    );
  }
}

export default Root;
