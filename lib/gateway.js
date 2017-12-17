/*
 * This is a default gateway (server) to be used during local data source
 * development. If the `--gateway` option is supplied, this is NOT used.
 */
import Express from 'express';
import getPort from 'get-port';
import bodyParser from 'body-parser';
import gramps from '@gramps/gramps';
import { GraphQLSchema } from 'graphql';
import { graphqlExpress } from 'apollo-server-express';
import playground from 'graphql-playground-middleware-express';
import { success } from './logger';

const GRAPHQL_ENDPOINT = '/graphql';
const TESTING_ENDPOINT = '/playground';
const DEFAULT_PORT = 8080;

async function startServer(app, { enableMockData, dataSources }) {
  const PORT = await getPort(DEFAULT_PORT);
  app.listen(PORT, () => {
    const mode = enableMockData ? 'mock' : 'live';
    success([
      '='.repeat(65),
      '',
      `  A GraphQL gateway has successfully started using ${mode} data.`,
      ``,
      `  The following GrAMPS data sources are running locally:`,
      ...dataSources.map(src => `    - ${src.namespace}`),
      ``,
      `  For UI development, point your GraphQL client to:`,
      `    http://localhost:${PORT}${GRAPHQL_ENDPOINT}`,
      ``,
      `  To test your data sources in the GraphQL Playground, visit:`,
      `    http://localhost:${PORT}${TESTING_ENDPOINT}`,
      ``,
      '  To stop this gateway, press `control` + `C`.',
      ``,
      '='.repeat(65),
    ]);
  });
}

export default config => {
  const app = Express();
  const GraphQLOptions = gramps(config);

  app.use(bodyParser.json());
  app.use(GRAPHQL_ENDPOINT, graphqlExpress(GraphQLOptions));
  app.use(TESTING_ENDPOINT, playground({ endpoint: GRAPHQL_ENDPOINT }));

  startServer(app, config);
};
