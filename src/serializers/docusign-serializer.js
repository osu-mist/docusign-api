import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';

const tabResourceProp = openapi.components.schemas.TabResource.properties;
const tabResourceType = tabResourceProp.type.enum[0];
const tabResourceKeys = _.keys(tabResourceProp.attributes.properties);
const tabResourcePath = 'pets';
const tabResourceUrl = resourcePathLink(apiBaseUrl, tabResourcePath);

/**
 * Serialize tabResources to JSON API
 *
 * @param {object[]} rawTabs Raw data rows from data source
 * @param {object} parsedQuery Parsed query object
 * @returns {object} Serialized tabResource object
 */
const serializeTabs = (rawTabs, parsedQuery) => {
  const topLevelSelfLink = paramsLink(tabResourceUrl, parsedQuery);
  const flattenTabs = [];

  _.forEach(rawTabs, (tabs, tabType) => {
    _.forEach(tabs, (tab) => {
      const flattenTab = {
        tabId: tab.tabId,
        name: tab.name,
        label: tab.tabLabel,
        scope: tab.tabScope,
        stampType: tab.stampType,
        tabType,
        value: tab.value,
        originalValue: tab.originalValue,
        scaleValue: tab.scaleValue,
        pageNumber: tab.pageNumber,
        optionalInd: tab.optional,
        recipientId: tab.recipientId,
        position: {
          x: tab.xPosition,
          y: tab.yPosition,
        },
        templateRecipient: {
          lockedInd: tab.templateLocked,
          requiredInd: tab.templateRequired,
        },
        signer: {
          lockedInd: tab.locked,
          requiredInd: tab.required,
        },
        shared: {
          sharedInd: tab.shared,
          requireAllInd: tab.requireAll,
          requireInitialOnSharedChangeInd: tab.requireInitialOnSharedChange,
        },
        font: {
          family: tab.font,
          size: tab.fontSize,
          color: tab.fontColor,
        },
        size: {
          height: tab.height,
          width: tab.width,
          maxLength: tab.maxLength,
        },
        validation: {
          pattern: tab.validationPattern,
          message: tab.validationMessage,
        },
        concealValueOnDocumentInd: tab.concealValueOnDocument,
        disableAutoSizeInd: tab.disableAutoSize,
        selectedInd: tab.selected,
        tabGroupLabels: tab.tabGroupLabels,
        group: {
          name: tab.groupName,
          label: tab.groupLabel,
          rule: tab.groupRule,
          minimumRequired: tab.minimumRequired,
          maximumAllowed: tab.maximumAllowed,
        },
        radios: [],
      };

      if (tabType === 'radioGroupTabs') {
        _.forEach(tab.radios, (rawRadio) => {
          const radio = {
            tabId: rawRadio.tabId,
            pageNumber: rawRadio.pageNumber,
            position: {
              x: rawRadio.xPosition,
              y: rawRadio.yPosition,
            },
            selectedInd: rawRadio.selected,
            value: rawRadio.value,
            signer: {
              lockedInd: rawRadio.locked,
              requiredInd: rawRadio.required,
            },
          };
          flattenTab.radios.push(radio);
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
    parsedQuery,
    enableDataLinks: false,
  };

  return new JsonApiSerializer(
    tabResourceType,
    serializerOptions(serializerArgs),
  ).serialize(flattenTabs);
};

export { serializeTabs };
