const newrelic = require('newrelic');

module.exports = {

  friendlyName: 'Report error',

  description: 'Reports an error to external services',

  inputs: {
    error: {
      type: 'ref',
      required: true,
    },
    req: {
      type: 'ref',
      defaultsTo: {},
    },

  },

  exits: {

    success: {
      description: 'All done.',
    },

  },

  async fn(inputs, exits) {
    let responseError = inputs.error;
    if (!inputs.req.me)inputs.req.me = {};

    const additionalContext = {
      data: inputs.req.body || {},
      query: inputs.req.query,
      headers: inputs.req.headers,
    };

    const additionalContextStringified = {
      data: JSON.stringify(inputs.req.body || {}),
      query: JSON.stringify(inputs.req.query),
      headers: JSON.stringify(inputs.req.headers),
    };
    if (typeof (responseError) === 'string') {
      responseError = new Error(responseError);
    }

    sails.log.error({...additionalContextStringified,'responseError':responseError})

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      newrelic.noticeError(responseError, additionalContext);
    }

    return exits.success();
  },

};
