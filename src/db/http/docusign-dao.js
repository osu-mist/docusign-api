import createError from 'http-errors';
import config from 'config';
import rp from 'request-promise-native';

import { httpOptions } from './connection';

const { baseUri } = config.get('dataSources.http');

/**
 * Return a list of pets
 *
 * @param {object} params request parameter object
 * @returns {Promise} Promise object represents a list of pets
 */
const getEnvelopeDocumentTabs = async (params) => {
  const { envelopeId, documentId } = params;

  let rawTabs;
  try {
    rawTabs = await rp.get({
      ...{ uri: `${baseUri}/envelopes/${envelopeId}/documents/${documentId}/tabs` },
      ...httpOptions,
    });
  } catch (err) {
    const { statusCode, error: { errorCode, message } } = err;
    if (statusCode === 400) {
      if (errorCode === 'INVALID_DOCUMENT_ID') {
        throw createError(404, 'documentId not found.');
      } else if (
        errorCode === 'INVALID_REQUEST_PARAMETER'
        && message === 'The request contained at least one invalid parameter. Invalid value '
        + 'specified for envelopeId.') {
        throw createError(404, 'envelopeId not found.');
      }
    }
  }
  return rawTabs;
};

export { getEnvelopeDocumentTabs };
