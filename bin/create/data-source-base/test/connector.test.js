import { GraphQLConnector } from '@gramps/gramps-express';
import Connector from '../src/connector';

// TODO: Update the data source name.
const DATA_SOURCE_NAME = '{{properCase name}}';
const connector = new Connector();

describe(`${DATA_SOURCE_NAME}Connector`, () => {
  it('inherits the GraphQLConnector class', () => {
    expect(connector).toBeInstanceOf(GraphQLConnector);
  });

  it('uses the appropriate URL', () => {
    expect(connector.apiBaseUri).toBe('{{url}}');
  });
});
