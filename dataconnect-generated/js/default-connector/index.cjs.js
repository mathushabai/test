const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'slotsage',
  location: 'asia-southeast1'
};
exports.connectorConfig = connectorConfig;

