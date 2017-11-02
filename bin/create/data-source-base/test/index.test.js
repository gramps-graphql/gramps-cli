import dataSource from '../src';
import Model from '../src/model';

const DATA_SOURCE_NAME = '{{properCase name}}';

describe(`Data Source: ${DATA_SOURCE_NAME}`, () => {
  it('returns a context type', () => {
    expect(dataSource.context).toBe(DATA_SOURCE_NAME);
  });

  it('returns a model', () => {
    expect(dataSource.model).toBeInstanceOf(Model);
  });

  it('returns a schema', () => {
    expect(dataSource.schema).toBeTruthy();
  });

  it('returns a resolver object', () => {
    expect(Object.keys(dataSource.resolvers)).toEqual([
      'queryResolvers',
      'dataResolvers',
      'mockResolvers',
    ]);
  });
});
