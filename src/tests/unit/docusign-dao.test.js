import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import proxyquireModule from 'proxyquire';
import rp from 'request-promise-native';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { createConfigStub } from './test-helpers';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

// Prevent call thru to original dependencies
const proxyquire = proxyquireModule.noCallThru();

describe('Test docusign-dao', () => {
  let rpGetStub;
  let docusignDao;

  afterEach(() => sinon.restore());

  const getEnvelopeDocumentTabsStub = () => {
    createConfigStub();
    docusignDao = proxyquire('db/http/docusign-dao', {
      rp: { get: rpGetStub },
    });
  };

  const testCases = [
    {
      description: 'Should resolve when rp.get resolves',
      rpResponse: {},
      expectedResult: {},
    },
    {
      description: 'Should throw internal server error if re.get throws unknown error',
      expectedResult: 'Unexpected internal error.',
      errorThrown: new Error('Unknown error'),
    },
    {
      description: 'Should throw 404 documentId not found',
      expectedResult: 'documentId not found.',
      errorThrown: {
        statusCode: 400,
        error: {
          errorCode: 'INVALID_DOCUMENT_ID',
          message: undefined,
        },
      },
    },
    {
      description: 'Should throw 404 envelopeId not found',
      expectedResult: 'envelopeId not found.',
      errorThrown: {
        statusCode: 400,
        error: {
          errorCode: 'INVALID_REQUEST_PARAMETER',
          message: 'The request contained at least one invalid parameter. Invalid value specified '
          + 'for envelopeId.',
        },
      },
    },
  ];

  describe('getEnvelopeDocumentTabs', () => {
    _.forEach(testCases, ({
      description, rpResponse, expectedResult, errorThrown,
    }) => {
      let result;
      it(description, async () => {
        if (errorThrown) {
          rpGetStub = sinon.stub(rp, 'get').rejects(errorThrown);
          getEnvelopeDocumentTabsStub();
          result = docusignDao.getEnvelopeDocumentTabs({
            envelopeId: 'fakeEnvelopeId',
            documentId: 'fakeDocumentId',
          });
          rpGetStub.should.have.been.calledOnce;
          return result.should.be.rejectedWith(expectedResult);
        }
        rpGetStub = sinon.stub(rp, 'get').resolves(rpResponse);
        getEnvelopeDocumentTabsStub();
        result = docusignDao.getEnvelopeDocumentTabs({
          envelopeId: 'fakeEnvelopeId',
          documentId: 'fakeDocumentId',
        });
        rpGetStub.should.have.been.calledOnce;
        return result.should.eventually.deep.equal(expectedResult);
      });
    });
  });
});
