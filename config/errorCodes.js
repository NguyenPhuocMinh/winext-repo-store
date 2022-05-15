'use strict';

const errorCodes = {
  InvalidLimitOptions: {
    message: 'Must be greater than zero number',
    returnCode: 4000,
    statusCode: 500
  },
  IdNotFound: {
    message: 'Id not found',
    returnCode: 4001,
    statusCode: 400
  },
  IntermediateTableRequired: {
    message: 'Intermediate table is required',
    returnCode: 4002,
    statusCode: 400
  },
};

module.exports = errorCodes;
