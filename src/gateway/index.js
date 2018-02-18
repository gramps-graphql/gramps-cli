import Express from 'express';

import configureApp from './configure-app';
import startServer from './start-server';
import hotReload from './hot-reload';
import { getDirName } from '../lib/data-sources';

export const GRAPHQL_ENDPOINT = '/graphql';
export const TESTING_ENDPOINT = '/playground';
export const DEFAULT_PORT = 8080;

export default async config => {
  const app = configureApp(Express(), config);
  const server = await startServer(app, config);
  hotReload(server, app, config);
};
