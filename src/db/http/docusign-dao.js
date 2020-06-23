import createError from 'http-errors';
import config from 'config';
import rp from 'request-promise-native';

import { serializeTabs } from 'serializers/docusign-serializer';
import { httpOptions } from './connection';

const { baseUri } = config.get('dataSources.http');

/**
 * Return a list of pets
 *
 * @param {object} params Request parameter object
 * @param {object} query Request query object
 * @returns {Promise} Promise object represents a list of pets
 */
const getEnvelopeDocumentTabs = async (params, query) => {
  const { envelopeId, documentId } = params;

  let rawTabs;
  try {
    rawTabs = await rp.get({
      ...{ uri: `${baseUri}/envelopes/${envelopeId}/documents/${documentId}/tabs` },
      ...httpOptions,
    });
    return serializeTabs(rawTabs, params, query);
  } catch (err) {
    const { statusCode } = err;
    if (statusCode === 400) {
      const { error: { errorCode, message } } = err;
      if (errorCode === 'INVALID_DOCUMENT_ID') {
        throw createError(404, 'documentId not found.');
      } else if (
        errorCode === 'INVALID_REQUEST_PARAMETER'
        && message === 'The request contained at least one invalid parameter. Invalid value '
        + 'specified for envelopeId.') {
        throw createError(404, 'envelopeId not found.');
      }
    }
    throw new Error('Unexpected internal error.');
  }
};

export { getEnvelopeDocumentTabs };
