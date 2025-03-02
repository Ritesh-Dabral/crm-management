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


  friendlyName: 'Bulk Chunk Entity Processing',


  description: 'Push the chunkEntityObject to the bulk chunk entity processing queue',


  inputs: {
    chunkEntityObject: {
      type: 'json',
      columnType: 'array',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const { chunkEntityObject } = inputs;
    try {
      const redisConfig = getRedisConfig();
      const chunkEntityRedisQueue = new Bull('chunk-entity',  { redis: redisConfig });
      const resp = await chunkEntityRedisQueue.addBulk(chunkEntityObject, { removeOnComplete: true, removeOnFail: true});
      await chunkEntityRedisQueue.close();
      sails.log.info(`Chunk entity queue registry successful >> chunkEntityId: ${chunkEntityId}`);
      return;
    } catch (error) {
      sails.log.error(`Error in chunk generation queue registry >> chunkEntityId: ${chunkEntityId}`, error);
      error.chunkEntityId = chunkEntityId;
      await sails.helpers.utils.reportError(error);
    } finally {
      return exits.success();
    }
  }


};



