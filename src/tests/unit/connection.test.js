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

describe('Test http connection module', () => {
  let configGetStub;
  let rpGetStub;
  let connection;

  beforeEach(() => {
    configGetStub = sinon.stub(config, 'get')
      .withArgs('dataSources.http')
      .returns({});
    rpGetStub = sinon.stub(rp, 'get');
  });
  afterEach(() => sinon.restore());

  const createHttpConnectionStub = () => {
    connection = proxyquire('db/http/connection', {
      config: { get: configGetStub },
      // suppress logger output for testing
      '../../utils/logger': { logger: { error: () => {} } },
    });
  };

  const testCases = [
    {
      description: 'Should resolve when rp.get resolves',
      rpGetStubReturns: Promise.resolve({}),
    },
    {
      description: 'Should throw error when rp.get reject',
      rpGetStubReturns: Promise.reject(new Error('fake error')).catch(() => {}),
    },
  ];

  describe('validateHttp', () => {
    _.forEach(testCases, ({ description, rpGetStubReturns }) => {
      it(description, async () => {
        createHttpConnectionStub();
        rpGetStub.returns(rpGetStubReturns);
        try {
          const result = await connection.validateHttp();
          assert.isUndefined(result);
        } catch (err) {
          assert.typeOf(err, 'error');
        } finally {
          rpGetStub.should.have.been.calledOnce;
        }
      });
    });
  });
});
