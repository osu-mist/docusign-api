import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';

const tabResourceProp = openapi.components.schemas.TabResource.properties;
const tabResourceType = tabResourceProp.type.enum[0];
const tabResourceKeys = _.keys(tabResourceProp.attributes.properties);
const tabResourcePath = 'tabs';
const envelopeResourceUrl = resourcePathLink(apiBaseUrl, 'docusign/envelopes');

/**
 * Convert string value to boolean
 *
 * @param {string} string string to be parsed
 * @returns {boolean} Parsed boolean value
 */
const toBoolean = (string) => {
  if (string === 'true') {
    return true;
  }
  if (string === 'false') {
    return false;
  }
  return null;
};

/**
 * Serialize tabResources to JSON API
 *
 * @param {object[]} rawTabs Raw data rows from data source
 * @param {object} params Request params object
 * @param {object} query Request query object
 * @returns {object} Serialized tabResource object
 */
const serializeTabs = (rawTabs, params, query) => {
  const { envelopeId, documentId } = params;
  const tabResourceUrl = resourcePathLink(
    envelopeResourceUrl,
    `${envelopeId}/documents/${documentId}/${tabResourcePath}`,
  );
  const topLevelSelfLink = paramsLink(tabResourceUrl, query);
  const flattenTabs = [];

  _.forEach(rawTabs, (tabs, tabType) => {
    _.forEach(tabs, (tab) => {
      const flattenTab = {
        tabId: tab.tabId,
        name: tab.name,
        label: tab.tabLabel,
        scope: tab.tabScope,
        stampType: tab.stampType,
        tabType: _.replace(tabType, /Tabs$/, ''),
        value: tab.value,
        originalValue: tab.originalValue,
        scaleValue: parseFloat(tab.scaleValue),
        pageNumber: parseInt(tab.pageNumber, 10),
        optionalInd: toBoolean(tab.optional),
        recipientId: tab.recipientId,
        position: {
          x: parseInt(tab.xPosition, 10),
          y: parseInt(tab.yPosition, 10),
        },
        templateRecipient: {
          lockedInd: toBoolean(tab.templateLocked),
          requiredInd: toBoolean(tab.templateRequired),
        },
        signer: {
          lockedInd: toBoolean(tab.locked),
          requiredInd: toBoolean(tab.required),
        },
        shared: {
          sharedInd: toBoolean(tab.shared),
          requireAllInd: toBoolean(tab.requireAll),
          requireInitialOnSharedChangeInd: toBoolean(tab.requireInitialOnSharedChange),
        },
        font: {
          family: tab.font,
          size: tab.fontSize,
          color: tab.fontColor,
        },
        size: {
          height: parseInt(tab.height, 10),
          width: parseInt(tab.width, 10),
          maxLength: parseInt(tab.maxLength, 10),
        },
        validation: {
          pattern: tab.validationPattern,
          message: tab.validationMessage,
        },
        concealValueOnDocumentInd: toBoolean(tab.concealValueOnDocument),
        disableAutoSizeInd: toBoolean(tab.disableAutoSize),
        selectedInd: toBoolean(tab.selected),
        tabGroupLabels: tab.tabGroupLabels,
        group: {
          name: tab.groupName,
          label: tab.groupLabel,
          rule: tab.groupRule,
          minimumRequired: parseInt(tab.minimumRequired, 10),
          maximumAllowed: parseInt(tab.maximumAllowed, 10),
        },
      };

      if (tabType === 'radioGroupTabs') {
        _.forEach(tab.radios, (rawRadio) => {
          flattenTab.tabId = rawRadio.tabId;
          flattenTab.pageNumber = parseInt(rawRadio.pageNumber, 10);
          flattenTab.position = {
            x: parseInt(rawRadio.xPosition, 10),
            y: parseInt(rawRadio.yPosition, 10),
          };
          flattenTab.selectedInd = toBoolean(rawRadio.selected);
          flattenTab.value = rawRadio.value;
          flattenTab.signer = {
            lockedInd: toBoolean(rawRadio.locked),
            requiredInd: toBoolean(rawRadio.required),
          };
        });
      }

      // replace undefined attributes with null so that serializer won't discard nullable fields
      _.forEach(flattenTab, (value, key) => {
        if ((_.isObject(value))) {
          _.forEach(value, (v, k) => {
            if (_.isUndefined(v)) {
              value[k] = null;
            }
          });
        }
        if (_.isUndefined(value) || (_.isObject(value) && _.every(value, _.isNull))) {
          flattenTab[key] = null;
        }
      });

      flattenTabs.push(flattenTab);
    });
  });

  const serializerArgs = {
    identifierField: 'tabId',
    resourceKeys: tabResourceKeys,
    resourcePath: tabResourcePath,
    topLevelSelfLink,
    query,
    enableDataLinks: false,
  };

  return new JsonApiSerializer(
    tabResourceType,
    serializerOptions(serializerArgs),
  ).serialize(flattenTabs);
};

export { serializeTabs };
