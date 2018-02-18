import chokidar from 'chokidar';

export default (paths, invokeFn) => {
  return new Promise((resolve, reject) => {
    const watcher = chokidar.watch(paths, {
      ignored: /node_modules|\.git/,
    });
    watcher.on('ready', () => {
      watcher.on('all', (event, ...args) => {
        invokeFn();
      });
      resolve();
    });
  });
};
