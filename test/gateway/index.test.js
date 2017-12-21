import Express from 'express';

import startDefaultGateway from '../../gateway';
import configureApp from '../../gateway/configure-app';
import startServer from '../../gateway/start-server';

jest.mock('express', () => jest.fn());
jest.mock('../../gateway/configure-app.js', () => jest.fn(() => 'TEST APP'));
jest.mock('../../gateway/start-server.js', () => jest.fn());

describe('gateway', () => {
  it('starts the default gateway', () => {
    startDefaultGateway({ dataSources: [] });

    expect(configureApp).toHaveBeenCalledWith(Express(), { dataSources: [] });
    expect(startServer).toHaveBeenCalledWith('TEST APP', { dataSources: [] });
  });
});
