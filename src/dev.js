import { EOL } from 'os';
import path from 'path';
import http from 'http';
import yargs from 'yargs';
import cleanup from 'node-cleanup';
import { spawn } from 'cross-spawn';
import startDefaultGateway from './gateway';
import {
  loadDataSources,
  transpileDataSources,
  cleanUpTempDir,
} from './lib/data-sources';
import cleanupOnExit from './lib/cleanup-on-exit';
import { warn } from './lib/logger';

const getDirPath = dir => path.resolve(process.cwd(), dir);

const startGateway = async ({
  mock,
  watch,
  gateway,
  processor,
  dataSources,
}) => {
  const { dataSourcePaths, loadedDataSources } = await processor();
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
    dataSourcePaths,
    enableMockData: mock,
    enableWatchMode: watch,
    originalDataSources: dataSources,
    dataSources: loadedDataSources,
    processDataSources: processor,
  });
};

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
    .group(['watch'], 'Choose whether to enable watch mode:')
    .option('watch', {
      alias: 'w',
      description: 'watch file changes on data sources',
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
    .group(
      ['transpile', 'no-transpile'],
      'Choose whether to transpile data sources with Babel:',
    )
    .option('transpile', {
      type: 'boolean',
      default: true,
    });

const processDataSources = (watch, transpile, dataSources) => async () => {
  let dataSourcePaths = [];
  let loadedDataSources = [];
  if (dataSources.length) {
    try {
      // Get an array of paths to the local data sources.
      dataSourcePaths = await transpileDataSources(transpile, dataSources);
      loadedDataSources = loadDataSources(dataSourcePaths);
    } catch (error) {
      // If something went wrong loading data sources, log it, tidy up, and die.
      console.error(error);
      await cleanUpTempDir();
      if (!watch) {
        process.exit(2); // eslint-disable-line no-process-exit
      }
    }
  }

  return { dataSourcePaths, loadedDataSources };
};

export const handler = async ({
  dataSources = [],
  mock = false,
  gateway,
  transpile,
  watch = false,
}) => {
  warn('The GrAMPS CLI is intended for local development only.');
  const processor = processDataSources(watch, transpile, dataSources);

  await startGateway({
    mock,
    watch,
    gateway,
    processor,
    dataSources,
  });
};

cleanup(cleanupOnExit);
