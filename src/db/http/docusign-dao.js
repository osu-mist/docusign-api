import config from 'config';
import rp from 'request-promise-native';

import { httpOptions } from './connection';

const { baseUri } = config.get('dataSources.http');

/**
 * Return a list of pets
 *
 * @returns {Promise} Promise object represents a list of pets
 */
const getEnvelopeDocumentTabs = async () => {
  const rawTabs = await rp.get({ ...{ uri: baseUri }, ...httpOptions });
  console.log(rawTabs);

  return rawTabs;
};

export { getEnvelopeDocumentTabs };
