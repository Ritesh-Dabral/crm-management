const Bull = require("bull");
const redisConfig = {
  host: sails.config.datastores.default.redisHost,
  port: sails.config.datastores.default.redisPort,
  password: sails.config.datastores.default.redisPassword,
  username: sails.config.datastores.default.redisUsername,
  db: sails.config.datastores.default.redisdb
};
const chunkGenerationQueue = new Bull("chunk-generation", { redis: redisConfig });


module.exports = {
  friendlyName: "Chunk generation",

  description: "Handles the chunk generation queue processing.",

  inputs: {},

  exits: {
    success: {
      description: "Queue processed successfully.",
    },
    error: {
      description: "An error occurred during queue processing.",
    },
  },

  fn: async function (inputs, exits) {

    // await callTranscriptionQueue.resume();

    callTranscriptionQueue.process(1, async (job, done) => {
      const messageData = job.data;
      const requiredKeys = ["chunkEntityId"];

      try {
        const isMessageValid = requiredKeys.every((key) => messageData.hasOwnProperty(key));

        sails.log.info(`Processing chunk generation message:`, messageData);

        if (!isMessageValid) {
          throw new Error(`Missing required keys in job data: ${JSON.stringify(messageData)}`);
        }
        await sails.helpers.file.chunkEntityProcessing.with({ chunkEntityId: messageData.chunkEntityId});
        sails.log.info("Chunk entity processing processed successfully for chunkEntityId:" + messageData.chunkEntityId);

      } catch (error) {
        sails.log.error("Error running chunk entity processing job:", error);
      } finally {
        return done();
      }
    });
  },
};
