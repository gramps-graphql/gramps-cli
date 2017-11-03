import yargs from 'yargs';
import * as create from './create/create';
import * as start from './start/start';

const argv = yargs
  .command('start [dir]', 'Start development server', start)
  .command('create [name]', 'Create a new data source', create).argv;
