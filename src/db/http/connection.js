import config from 'config';
import rp from 'request-promise-native';

import { logger } from 'utils/logger';

const {
  baseUri,
  username,
  password,
  integratorKey,
} = config.get('dataSources.http');

const httpOptions = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-DocuSign-Authentication': JSON.stringify({
      Username: username,
      Password: password,
      IntegratorKey: integratorKey,
    }),
  },
  json: true,
};

/**
 * Validate http connection and throw an error if invalid
 *
 * @returns {Promise} resolves if http connection can be established and rejects otherwise
 */
const validateHttp = async () => {
  try {
    await rp.get({ ...{ uri: baseUri }, ...httpOptions });
  } catch (err) {
    logger.error(err);
    throw new Error('Unable to connect to HTTP data source');
  }
};

export { httpOptions, validateHttp };
