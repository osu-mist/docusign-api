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

describe('Test http connection module', () => {
  let rpGetStub;
  let connection;
  let validateHttp;

  afterEach(() => sinon.restore());

  const createHttpConnectionStub = () => {
    createConfigStub();
    connection = proxyquire('db/http/connection', {
      rp: { get: rpGetStub },
      // suppress logger output for testing
      '../../utils/logger': { logger: { error: () => {} } },
    });
  };

  const testCases = [
    {
      description: 'Should resolve when rp.get resolves',
      expectedResult: undefined,
    },
    {
      description: 'Should throw error when rp.get throw an error',
      expectedResult: 'Unable to connect to HTTP data source',
      errorThrown: new Error('fake error'),
    },
  ];

  describe('validate http data source', () => {
    _.forEach(testCases, ({ description, expectedResult, errorThrown }) => {
      it(description, async () => {
        if (errorThrown) {
          rpGetStub = sinon.stub(rp, 'get').rejects(errorThrown);
          createHttpConnectionStub();
          validateHttp = connection.validateHttp();
          rpGetStub.should.have.been.calledOnce;
          return validateHttp.should.be.rejectedWith(expectedResult);
        }
        rpGetStub = sinon.stub(rp, 'get').resolves({});
        createHttpConnectionStub();
        validateHttp = connection.validateHttp();
        rpGetStub.should.have.been.calledOnce;
        return validateHttp.should.eventually.equal(expectedResult);
      });
    });
  });
});
