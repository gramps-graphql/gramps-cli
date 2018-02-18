import Express from 'express';
import configureApp from './configure-app';
import watchPaths from '../lib/watcher';
import cache from './cache';
import { getDirName } from '../lib/data-sources';

export default (server, app, config) => {
  if (config.enableWatchMode) {
    let currentApp = app;
    let currentSourcePaths = config.dataSourcePaths;

    watchPaths(config.originalDataSources, async () => {
      Object.keys(cache).forEach(id => {
        if (
          currentSourcePaths.filter(p => id.indexOf(getDirName(p)) !== -1)
            .length > 0
        ) {
          delete cache[id];
        }
      });
      const {
        dataSourcePaths: newDataSourcePaths,
        loadedDataSources: newDataSources,
      } = await config.processDataSources();
      const newApp = configureApp(
        Express(),
        Object.assign({}, config, {
          dataSources: newDataSources,
          dataSourcePaths: newDataSourcePaths,
        }),
      );
      server.removeListener('request', currentApp);
      server.on('request', newApp);
      currentApp = newApp;
      currentSourcePaths = newDataSourcePaths;
    });
  }
};
