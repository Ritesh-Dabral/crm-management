require('newrelic');
require('../../../elastic-apm-node');

module.exports = function init(sails) {

    return {
        initialize: async function () {
            // const dotenv = require('dotenv');
            // dotenv.config();
            //Initializing mongoose
            require('../../mongoose/init');
            // require('../../consumer/chunk-generation-consumer-init')
            // require('../../consumer/chunk-entity-processing-consumer-ini')
        },
        routes: {

            /**
             * Runs before every matching route.
             *
             * @param {Ref} req
             * @param {Ref} res
             * @param {Function} next
             */
            before: {
              '/*': {
                skipAssets: true,
                async fn(req, res, next) {
                  req.headers.url = req.url;
                  req.id = req.headers['cf-request-id'];
                  if (!req.id)req.id = Date.now();
                  sails.log(JSON.stringify({
                    ...req.headers, method: req.method, body: req.body, query: req.query,
                  }));
                  return next();
                },
              },
            },
          },
    };
}
