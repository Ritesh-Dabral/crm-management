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
      const requiredKeys = ["actionId"];

      try {
        const isMessageValid = requiredKeys.every((key) => messageData.hasOwnProperty(key));

        sails.log.info(`Processing chunk generation message:`, messageData);

        if (!isMessageValid) {
          throw new Error(`Missing required keys in job data: ${JSON.stringify(messageData)}`);
        }
        await sails.helpers.file.chunkGeneration.with({ actionId: messageData.actionId });
        sails.log.info("Chunk generation processed successfully for actionId:" + messageData.actionId);

      } catch (error) {
        sails.log.error("Error running chunk generation job:", error);
      } finally {
        return done();
      }
    });
  },
};
