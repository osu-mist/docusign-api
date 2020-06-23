import { getEnvelopeDocumentTabs } from 'db/http/docusign-dao';
import { errorBuilder, errorHandler } from 'errors/errors';

/**
 * Returns the tabs on a document
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { params, query } = req;

    const rawTabs = await getEnvelopeDocumentTabs(params, query);
    const result = rawTabs;
    return res.send(result);
  } catch (err) {
    const { statusCode, message } = err;
    if (statusCode) {
      return errorBuilder(res, statusCode, message);
    }
    return errorHandler(res, err);
  }
};

export { get };