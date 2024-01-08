'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const tls = require('tls');

const cloneDeep = require('lodash.clonedeep');
const getenv = require('getenv');

const log = require('@sealsystems/log').getLogger();

const readFile = util.promisify(fs.readFile);

let isWarningLogged = false;

const types = {
  key: { optional: false },
  cert: { optional: false },
  ca: { optional: true }
};

const tlscert = {};

tlscert.cache = {};

tlscert.get = async function (env = 'TLS_DIR') {
  log.debug(`Using environment variable ${env}.`);

  let directory;
  try {
    directory = getenv(env);
  } catch (err) {
    // intentionally empty
  }

  let isFallback = false;

  if (!directory) {
    isFallback = true;
    directory = path.join(__dirname, 'keys', 'localhost.selfsigned');

    /* eslint-disable no-process-env */
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    /* eslint-enable no-process-env */

    if (!isWarningLogged) {
      log.warn('Using self-signed certificate. TLS checks disabled.');
      isWarningLogged = true;
    }
  }

  if (tlscert.cache[directory]) {
    return cloneDeep(tlscert.cache[directory]);
  }

  const result = {
    isFallback
  };

  const keys = Object.keys(types);

  for (let i = 0; i < keys.length; i++) {
    const type = keys[i];
    const fileName = path.join(directory, `${type}.pem`);

    try {
      result[type] = await readFile(fileName, 'utf8');
    } catch (e) {
      if (!types[type].optional) {
        throw e;
      }

      // Silently ignore the error, as we only export those things that are
      // actually present in the file system.
      log.info(`Ignoring missing ${type} certificate.`, { directory });
    }
  }

  tlscert.cache[directory] = cloneDeep(result);

  return result;
};

tlscert.getExternal = async function () {
  let env;
  if (getenv('TLS_PADIR', '')) {
    env = 'TLS_PADIR';
  }
  if (getenv('TLS_EXTERNAL_DIR', '')) {
    env = 'TLS_EXTERNAL_DIR';
  }
  log.debug('Use external certificate directory', { env });
  return await tlscert.get(env);
};

const versionMap = {
  TLSv1_method: 'TLSv1',
  TLSv1_1_method: 'TLSv1.1',
  TLSv1_2_method: 'TLSv1.2',
  TLSv1_3_method: 'TLSv1.3'
};

tlscert.getTlsMinVersion = async function () {
  const value = versionMap[getenv('TLS_PROTOCOL', '')] || getenv('TLS_MIN_VERSION', '');
  if (!value) {
    log.debug('Tls version was undefined. Is set to: ', tls.DEFAULT_MIN_VERSION);
    return tls.DEFAULT_MIN_VERSION;
  }
  log.debug('Tls version: ', value);
  return value;
};

module.exports = tlscert;
