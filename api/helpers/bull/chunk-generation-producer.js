const Bull = require("bull");

const getRedisConfig = () => {
  return {
    host: sails.config.datastores.default.redisHost,
    port: sails.config.datastores.default.redisPort,
    password: sails.config.datastores.default.redisPassword,
    username: sails.config.datastores.default.redisUsername,
    db: sails.config.datastores.default.redisdb
  }
}


module.exports = {


  friendlyName: 'Bulk Action Chunk Generation',


  description: 'Push the actionId to the bulk action chunk generation queue',


  inputs: {
    actionId: {
      type: 'string',
      required: true
    },
    delayInMs: {
      type: 'number',
      required: false,
      defaultsTo: 0
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
      const { actionId, delayInMs } = inputs;
    try {
      const redisConfig = getRedisConfig();
      const chunkGenerationRedisQueue = new Bull('chunk-generation',  { redis: redisConfig });
      const resp = await chunkGenerationRedisQueue.add({'actionId': actionId}, { removeOnComplete: true, removeOnFail: true, delay: delayInMs});
      await chunkGenerationRedisQueue.close();
      sails.log.info(`Chunk generation queue registry successful >> actionId: ${actionId}`);
      return;
    } catch (error) {
      sails.log.error(`Error in chunk generation queue registry >> actionId: ${actionId}`, error);
      error.actionId = actionId;
      await sails.helpers.utils.reportError(error);
    } finally {
      return exits.success();
    }
  }


};


