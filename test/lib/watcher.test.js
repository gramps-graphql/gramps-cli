import chokidar from 'chokidar';
import EventEmitter from 'events';
import watcher from '../../src/lib/watcher';

const mockWatcher = new EventEmitter();

jest.mock('chokidar', () => ({
  watch: jest.fn((paths, options) => mockWatcher),
}));

describe('lib/watcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls chokidar.watch with correct params', () => {
    const paths = ['path1', 'path2'];
    const mockFn = jest.fn();

    watcher(paths, mockFn);

    expect(chokidar.watch).toBeCalledWith(paths, {
      ignored: /node_modules|\.git/,
    });
  });

  it('invokes callback on correct event', () => {
    const paths = ['path1'];
    const mockFn = jest.fn();

    watcher(paths, mockFn);

    mockWatcher.emit('ready');
    mockWatcher.emit('all');

    expect(mockFn).toBeCalled();
  });
});
