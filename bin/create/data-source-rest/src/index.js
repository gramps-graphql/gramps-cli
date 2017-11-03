import schema from './schema.graphql';
import resolvers from './resolvers';
import mocks from './mocks';
import Connector from './connector';
import Model from './model';

/*
 * For more information on the main data source object, see
 * https://ibm.biz/graphql-data-source-main
 */
export default {
  context: '{{properCase name}}',
  model: new Model({ connector: new Connector() }),
  schema,
  resolvers,
  mocks,
};
