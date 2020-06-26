import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import { openapi } from 'utils/load-openapi';
import { createConfigStub } from './test-helpers';
import testData from './test-data';

chai.should();
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Test docusign-serializer', () => {
  createConfigStub();
  const docusignSerializer = proxyquire('serializers/docusign-serializer', {});
  sinon.restore();

  /**
   * Helper function to get schema from openapi specification
   *
   * @param {string} schema the name of schema
   * @param {object} nestedOption nested option
   * @returns {object} the result of definition
   */
  const getComponentSchemaProps = (schema, nestedOption) => {
    let result = openapi.components.schemas[schema].properties;

    if (nestedOption) {
      const { dataItem, dataField } = nestedOption;
      if (dataItem) {
        result = result.data.items.properties.attributes.properties;
      } else if (dataField) {
        result = result.data.properties.attributes.properties[dataField].items.properties;
      }
    }
    return result;
  };

  /**
   * Helper function to check the schema of tab resource
   *
   * @param {object} resource resource to check
   */
  const checkITabSchema = (resource) => {
    const {
      type,
      links,
      id,
      attributes,
    } = resource;
    const tabProps = getComponentSchemaProps('TabResource');

    expect(resource).to.contain.keys(_.keys(tabProps));
    expect(type).to.equal(openapi.components.schemas.TabResource.properties.type.enum[0]);
    expect(links).to.contain.keys(_.keys(getComponentSchemaProps('SelfLink')));
    expect(id).to.match(new RegExp(tabProps.id.pattern));
    expect(attributes).to.contain.keys(_.keys(tabProps.attributes.properties));
  };

  it('test serializeTabs', () => {
    const { fakeTabsTestCases } = testData;

    const serializedTabs = docusignSerializer.serializeTabs(fakeTabsTestCases, {
      envelopeId: 'fakeEnvelopeId',
      documentId: 'fakeDocumentId',
    });

    expect(serializedTabs).to.have.keys(getComponentSchemaProps('TabSetResult'));

    const { links, data } = serializedTabs;
    expect(links).to.contain.keys(_.keys(getComponentSchemaProps('SelfLink')));
    expect(data).to.be.an('array');

    _.forEach(data, (tab) => {
      checkITabSchema(tab);
    });
  });
});
