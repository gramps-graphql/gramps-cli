import { EOL } from 'os';
import path from 'path';
import yargs from 'yargs';
import cleanup from 'node-cleanup';
import { spawn } from 'cross-spawn';
import startDefaultGateway from '../lib/gateway';
import {
  loadDataSources,
  transpileDataSources,
  cleanUpTempDir,
} from '../lib/data-sources';
import { log, success, warn } from '../lib/logger';

const getDirPath = dir => path.resolve(process.cwd(), dir);

export const command = 'dev';
export const description = 'run a GraphQL gateway for local development';

export const builder = yargs =>
  yargs
    .group(['data-source'], 'Choose data source(s) for local development:')
    .option('data-source', {
      alias: ['data-sources', 'd'],
      description: 'path to one or more data sources',
      type: 'array',
    })
    .group(['gateway'], 'Choose a GraphQL gateway to run the data sources:')
    .option('gateway', {
      alias: 'g',
      description: 'path to a GraphQL gateway start script',
      type: 'string',
    })
    .coerce('d', srcArr => srcArr.map(getDirPath))
    .coerce('g', getDirPath)
    .group(['live', 'mock'], 'Choose real or mock data:')
    .options({
      live: {
        alias: 'l',
        conflicts: 'mock',
        description: 'run GraphQL with live data',
      },
      mock: {
        alias: 'm',
        conflicts: 'live',
        description: 'run GraphQL offline with mock data',
      },
    })
    .group('no-transpile', 'Turn Babel on or off:')
    .options({
      transpile: {
        description: 'don’t transpile data sources (point to a build dir)',
        type: 'boolean',
        default: true,
      },
    });

export const handler = async ({
  dataSources = [],
  mock = false,
  gateway,
  transpile,
}) => {
  warn('The GrAMPS CLI is intended for local development only.');

  let dataSourcePaths = [];
  let loadedDataSources = [];
  if (dataSources.length) {
    // Get an array of paths to the local data sources.
    dataSourcePaths = await transpileDataSources(transpile, dataSources);
    loadedDataSources = loadDataSources(dataSourcePaths);
  }

  // If a custom gateway was specified, set the env vars and start it.
  if (gateway) {
    // Define GrAMPS env vars.
    process.env.GRAMPS_MODE = mock ? 'mock' : 'live';
    process.env.GRAMPS_DATA_SOURCES = dataSourcePaths.length
      ? dataSourcePaths.join(',')
      : '';

    // Start the user-specified gateway.
    spawn('node', [gateway], { stdio: 'inherit' });
    return;
  }

  // If we get here, fire up the default gateway for development.
  startDefaultGateway({
    dataSources: loadedDataSources,
    enableMockData: mock,
  });
};

cleanup((exitCode, signal) => {
  log(' -> cleaning up temporary files');
  // Delete the temporary directory.
  cleanUpTempDir().then(() => {
    success('Successfully shut down. Thanks for using GrAMPS!');
    process.kill(process.pid, signal);
  });

  // Uninstall the handler to prevent an infinite loop.
  cleanup.uninstall();
  return false;
});
