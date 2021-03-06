import Express from 'express';

import configureApp from './configure-app';
import startServer from './start-server';

export const GRAPHQL_ENDPOINT = '/graphql';
export const TESTING_ENDPOINT = '/playground';
export const DEFAULT_PORT = 8080;

export default async config => {
  const app = await configureApp(Express(), config);
  startServer(app, config);
};
