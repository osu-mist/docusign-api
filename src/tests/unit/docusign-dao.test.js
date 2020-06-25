import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import _ from 'lodash';
import proxyquireModule from 'proxyquire';
import rp from 'request-promise-native';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

// Prevent call thru to original dependencies
const proxyquire = proxyquireModule.noCallThru();

describe('Test docusign-dao', () => {
  let configGetStub;
  let rpGetStub;
  let docusignDao;

  beforeEach(() => {
    configGetStub = sinon.stub(config, 'get')
      .withArgs('dataSources.http')
      .returns({});
    rpGetStub = sinon.stub(rp, 'get');
  });
  afterEach(() => sinon.restore());

  const getEnvelopeDocumentTabsStub = () => {
    docusignDao = proxyquire('db/http/docusign-dao', {
      config: { get: configGetStub },
      '../../utils/uri-builder': { paramsLink: {} },
    });
  };

  const testCases = [
    // {
    //   description: 'Should resolve when rp.get resolves',
    //   rpGetStubReturns: Promise.resolve({}),
    //   expectedResult: {},
    // },
    // {
    //   description: 'Should throw internal server error if re.get throws unknown error',
    //   rpGetStubReturns: Promise.resolve(new Error('fake error')),
    //   expectedResult: new Error('Unexpected internal error.'),
    // },
  ];

  describe('getEnvelopeDocumentTabs', () => {
    _.forEach(testCases, ({ description, rpGetStubReturns, expectedResult }) => {
      it(description, async () => {
        getEnvelopeDocumentTabsStub();
        rpGetStub.returns(rpGetStubReturns);
        const result = await docusignDao.getEnvelopeDocumentTabs({
          envelopeId: 'fakeEnvelopeId',
          documentId: 'fakeDocumentId',
        });
        assert.deepEqual(result, expectedResult);
        rpGetStub.should.have.been.calledOnce;
      });
    });
  });
});
