import Express from 'express';
import hotReload from '../../src/gateway/hot-reload';
import watchPaths from '../../src/lib/watcher';

jest.mock('../../src/lib/watcher', () => jest.fn((paths, cb) => cb()));

const mockApp = jest.fn();
const mockServer = {
  removeListener: jest.fn(),
  on: jest.fn(),
};

describe('gateway/hot-reload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('skips hot reload is watch mode is not enabled', () => {
    hotReload(mockServer, mockApp, {
      enableWatchMode: false,
    });

    expect(watchPaths).not.toHaveBeenCalled();
  });

  describe('hot reload is enabled', () => {
    it('calls watchPaths', () => {
      const config = {
        enableWatchMode: true,
        originalDataSources: [],
        dataSourcePaths: ['dist/.tmp/path1', 'dist/.tmp/path2'],
        processDataSources: jest.fn(() => ({
          dataSourcePaths: ['dist/.tmp/path1', 'dist/.tmp/path2'],
        })),
      };

      hotReload(mockServer, mockApp, config);

      expect(watchPaths).toHaveBeenCalledWith(
        config.originalDataSources,
        expect.any(Function),
      );
    });

    it('clears correct require cache', () => {
      jest.resetModules();
      jest.mock('../../src/gateway/cache', () => ({
        [`datasource1/node_modules/a`]: {},
        [`datasource2/node_modules/b`]: {},
        [`node_modules/c`]: {},
      }));
      /* eslint-disable global-require */
      const cache = require('../../src/gateway/cache');
      const hotReload = require('../../src/gateway/hot-reload').default;
      /* eslint-enable global-require */

      const paths = ['datasource1', 'datasource2'];

      hotReload(mockServer, mockApp, {
        enableWatchMode: true,
        originalDataSources: paths,
        dataSourcePaths: ['dist/.tmp/datasource1', 'dist/.tmp/datasource2'],
        processDataSources: jest.fn(() => ({
          dataSourcePaths: ['dist/.tmp/datasource1', 'dist/.tmp/datasource2'],
        })),
      });

      expect(cache).not.toHaveProperty('datasource1/node_modules/a');
      expect(cache).not.toHaveProperty('datasource2/node_modules/b');
      expect(cache).toHaveProperty('node_modules/c');
    });
  });
});
