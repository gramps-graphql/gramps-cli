import yargs from 'yargs';
import * as start from './start/start';

const argv = yargs.command('start [dir]', 'Start development server', start)
  .argv;
