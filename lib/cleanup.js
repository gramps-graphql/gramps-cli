export default (options, err) => {
  process.stdin.resume();

  console.log('Buh-bye!');

  if (err) {
    console.error(err);
  }

  if (options.cleanup) {
    console.log('cleaning up');
  }

  if (options.exit) {
    console.log('exiting...');

    // Runs the cleanup process
    process.exit(); // eslint-disable-line no-process-exit
  }
};
