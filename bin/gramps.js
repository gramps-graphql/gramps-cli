import { EOL } from 'os';
import yargs from 'yargs';
import dev from './dev';

yargs
  .command(dev)
  // .demandCommand()
  .help().argv;
