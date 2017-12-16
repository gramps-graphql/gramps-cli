import { EOL } from 'os';
import yargs from 'yargs';
import cleanup from 'node-cleanup';

import { description, version } from '../package.json';
import dev from './dev';
// import cleanup from '../lib/cleanup';

yargs
  .command(dev)
  .demandCommand()
  .help().argv;

cleanup(
  () => {
    // console.log('exiting...');
  },
  {
    ctrl_C: `${EOL}${EOL}Thanks for using GrAMPS!`,
  },
);
