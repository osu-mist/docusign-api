import { getEnvelopeDocumentTabs } from 'db/http/docusign-dao';
import { errorHandler } from 'errors/errors';

/**
 * Returns the tabs on a document
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const rawTabs = await getEnvelopeDocumentTabs(req.query);

    console.log(rawTabs);

    const result = null;

    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

export { get };
