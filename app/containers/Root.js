// @flow
import React, { Component } from 'react';
import { format } from 'date-fns';
import { chooseAction, randomDate, scroll } from '../helpers';
import classes from './Root.modules.css';

const knex = require('knex')({
  client: 'sqlite3', connection: { filename: './tasks.sqlite' }
});

let tasksDiv: $ElementType<HTMLDivElement> | null = null;
const memoizedSize: number = 60;
const fetchLimit: number = 20;
let maxTasks: number = 400;
const actions = ['create', 'update'];

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

            tasksDiv.scrollTop = 1500;
          });
      }
    }
  };

  fetchPrevTasks = (): void => {
    const { tasks } = this.state;

    if (tasks.length >= memoizedSize) {
      knex('tasks').where('created_at', '>', tasks[0].created_at)
        .orderBy('created_at', 'asc')
        .limit(fetchLimit)
        .then(res => {
          if (res.length) {
            res.reverse();
            const slicedTasks: Array<Task> = tasks.slice(0, tasks.length - fetchLimit);

            this.setState({ tasks: [...res, ...slicedTasks] });
            tasksDiv.scrollTop = 1500;
          }
        });
    }
  };

  updateTask = (): void => {
    const { tasks } = this.state;

    const randomId: number = Math.floor(Math.random() * 10);

    const updatedTitle: string = 'Updated title';
    let taskIndex: number | null = null;

    knex('tasks').where('id', randomId)
      .update({ title: updatedTitle })
      .then(res => console.log(res))
      .catch(err => console.log(err));

    tasks.forEach((task: Task, index: number) => {
      if (task.id === randomId) {
        taskIndex = index;
      }
    });

    if (taskIndex) {
      const updatedTasks: Array<Task> = [...tasks];
      updatedTasks[taskIndex].title = updatedTitle;

      this.setState({ tasks: updatedTasks });
    }
  };

  callRandomAction = (action: string): void => {
    switch (action) {
      case 'update': {
        this.updateTask();
        break;
      }
      case 'create':
        this.createTask();
        break;
      default:
        this.updateTask();
    }
  };

  createTask = (): void => {
    const newTask: Task = {
      title: 'Created Task',
      created_at: randomDate(new Date(2000, 0, 1), new Date())
    };

    knex('tasks').insert(newTask).then(() => maxTasks += 1);
  };

  componentDidMount() {
    tasksDiv = document.getElementById('tasks');
    tasksDiv.addEventListener('scroll', () => scroll(tasksDiv, this.fetchTasks, this.fetchPrevTasks));

    // if (!seedDb()) {
      knex('tasks').where({}).limit(fetchLimit).orderBy('created_at', 'desc')
        .then((res: Array<Task>) => {
          this.setState({ tasks: res });
        });
    // }

    setInterval(() => this.callRandomAction(chooseAction(actions)), 10000);
    setTimeout(() => Root.forceUpdate(), 100)
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
