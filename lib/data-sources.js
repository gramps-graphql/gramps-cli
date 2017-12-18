import fs from 'fs';
import path from 'path';
import cpy from 'cpy';
import del from 'del';
import mkdirp from 'mkdirp';
import babel from 'babel-core';
import globby from 'globby';
import { error, log, warn } from './logger';

const TEMP_DIR = path.resolve(__dirname, '..', '.tmp');

const handleError = (err, msg, callback) => {
  if (!err) {
    return;
  }

  error(msg || err);

  if (callback) {
    callback(err);
    return;
  }

  throw err;
};

const getDirName = dir =>
  dir
    .split('/')
    .filter(str => str)
    .slice(-1)
    .pop();

export const cleanUpTempDir = () => {
  if (fs.existsSync(TEMP_DIR)) {
    log(' -> cleaning up temporary files');
    return del(TEMP_DIR, { force: true });
  }

  // If there’s no temp dir, return a resolved promise (basically a no-op).
  return Promise.resolve(false);
};

const makeTempDir = tmpDir =>
  new Promise((resolve, reject) => {
    mkdirp(tmpDir, err => {
      handleError(err, `Unable to create ${tmpDir}`, reject);
      log(` -> created a temporary directory at ${tmpDir}`);
      resolve(tmpDir);
    });
  });

const makeParentTempDir = () =>
  new Promise((resolve, reject) => {
    cleanUpTempDir().then(() => {
      mkdirp(TEMP_DIR, err => {
        handleError(err, `Could not create ${TEMP_DIR}`);
        resolve(TEMP_DIR);
      });
    });
  });

const isValidDataSource = dataSourcePath => {
  if (!fs.existsSync(dataSourcePath)) {
    warn(`Could not load a data source from ${dataSourcePath}`);
    return false;
  }

  return true;
};

const loadDataSourceFromPath = dataSourcePath => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const src = require(dataSourcePath);
  const dataSource = src.default || src;

  if (!dataSource.namespace || !dataSource.context || !dataSource.typeDefs) {
    error([
      `Error: this data source is missing required properties:`,
      dataSourcePath,
    ]);

    throw new Error('Invalid data source.');
  }

  log(` -> successfully loaded ${dataSource.namespace}`);

  return src.default || src;
};

export const loadDataSources = pathArr => {
  return pathArr.filter(isValidDataSource).map(loadDataSourceFromPath);
};

const writeTranspiledFile = ({ filename, tmpFile, transpiled }) =>
  new Promise((resolve, reject) => {
    fs.writeFile(tmpFile, transpiled.code, err => {
      handleError(err, `Unable to transpile ${tmpFile}`, reject);
      resolve(filename);
    });
  });

// For convenience, we transpile data sources using GrAMPS settings.
const transpileJS = dataSource => tmpDir =>
  new Promise((resolve, reject) => {
    const filePromises = globby
      .sync(path.join(dataSource, '{src,}/*.js'))
      .map(file => {
        const filename = path.basename(file);

        return {
          filename,
          tmpFile: path.join(tmpDir, filename),
          transpiled: babel.transformFileSync(file),
        };
      })
      .map(writeTranspiledFile);

    Promise.all(filePromises).then(() => resolve(tmpDir));
  });

const copyGraphQLFiles = dataSource => tmpDir =>
  new Promise((resolve, reject) => {
    const filePromises = globby
      .sync(path.join(dataSource, '{src,}/*.graphql'))
      .map(file => cpy(file, tmpDir));

    Promise.all(filePromises).then(() => resolve(tmpDir));
  });

// We have to symlink node_modules or we’ll get errors when requiring packages.
const symlinkNodeModules = dataSource => tmpDir =>
  new Promise((resolve, reject) => {
    fs.symlink(
      path.join(dataSource, 'node_modules'),
      path.join(tmpDir, 'node_modules'),
      err => {
        handleError(err, 'Unable to symlink the Node modules folder', reject);
        resolve(tmpDir);
      },
    );
  });

const transpileDataSource = parentDir => dataSource =>
  new Promise((resolve, reject) => {
    const dirName = getDirName(dataSource);
    const tmpDir = path.join(parentDir, dirName);

    // Make a temporary directory for the data source.
    makeTempDir(tmpDir)
      .then(transpileJS(dataSource))
      .then(copyGraphQLFiles(dataSource))
      .then(symlinkNodeModules(dataSource))
      .then(resolve)
      .catch(err => handleError(err, null, reject));
  });

export const transpileDataSources = (shouldTranspile, dataSources) =>
  new Promise((resolve, reject) => {
    if (!shouldTranspile) {
      resolve(dataSources);
      return;
    }

    makeParentTempDir()
      .then(parentDir =>
        dataSources
          .filter(isValidDataSource)
          .map(transpileDataSource(parentDir)),
      )
      .then(dataSourcePromises => {
        Promise.all(dataSourcePromises).then(resolve);
      })
      .catch(reject);
  });
