import path from 'path';
import yargs from 'yargs';
import startDefaultGateway from '../lib/gateway';

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

export const handler = ({
  dataSources = [],
  mock = false,
  gateway,
  transpile,
}) => {
  console.log({
    dataSources,
    gateway,
    mock,
    transpile,
  });

  if (!gateway) {
    startDefaultGateway({
      dataSources,
      enableMockData: mock,
    });
  }
};
