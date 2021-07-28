'use strict';

const errorCodes = {
  InvalidLimitOptions: {
    message: 'must be greater than zero number',
    returnCode: 4000,
    statusCode: 500
  },
};

module.exports = errorCodes;
