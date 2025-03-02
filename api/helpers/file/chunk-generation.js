
const mongoose = require("mongoose");
const File = require('../../../services/file.class');

module.exports = {
  friendlyName: "Chunk generation",

  description: "Handles the chunk generation queue processing.",

  inputs: {
    actionId: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: "Queue processed successfully.",
    },
    error: {
      description: "An error occurred during queue processing.",
    },
  },

  fn: async function (inputs, exits) {

    const actionResponse = await action.findOne({ _id: inputs.actionId, status: 'queued' }).lean();
    if (!actionResponse) {
      sails.log.info('Action not found or status is not queued for actionId:' + inputs.actionId);
      return exits.success();
    }

    const file = new File();
    file.setFileId(actionResponse.file._id);
    const fileResponse = await file.getFileById();

    try {
      const axios = require('axios');
      const csv = require('csv-parser');

      const CHUNK_SIZE = 1000;
      let currentChunk = [];
      let chunks = [];

      const fileUrl = _.get(fileResponse, 'url', '');
      // Stream the CSV file from URL
      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream'
      });

      // Process the stream
      await new Promise((resolve, reject) => {
        response.data
          .pipe(csv())
          .on('data', (row) => {
            currentChunk.push(row);

            if (currentChunk.length === CHUNK_SIZE) {
              chunks.push([...currentChunk]);
              currentChunk = [];
            }
          })
          .on('end', () => {
            // Push the last chunk if it has any remaining rows
            if (currentChunk.length > 0) {
              chunks.push(currentChunk);
            }
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      sails.log.info(`Generated ${chunks.length} chunks for actionId: ${inputs.actionId}`);

      const fileChunks = chunks.map(chunk => {
        return {
          actionId: inputs.actionId,
          fileId: fileResponse._id.toString(),
          chunk: chunk
        };
      });

      const session = await mongoose.startSession();
      try {
        await session.startTransaction();

        const chunkEntityMappings = [];
        const fileChunksResponse = await actionFileChunk.insertMany(fileChunks, { session });

        fileChunksResponse.forEach( (fileChunk) => {
          actionResponse.actions.forEach( (processing) => {
            chunkEntityMappings.push({
              chunkId: fileChunk._id.toString(),
              processConfig: processing,
              status: 'queued'
            });
          });
        });

        const chunkEntityMappingResponse = await chunkEntityMapping.insertMany(chunkEntityMappings, { session });


        const jobs = chunkEntityMappingResponse.map( (chunkEntityMapping) => {
          return chunkEntityMapping._id.toString();
        });

        await sails.helpers.bull.chunkEntityBulkProducer.with({ chunkEntityObject: jobs });


        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }

      return exits.success();

    } catch (error) {
      sails.log.error(`Error in chunk generation for actionId: ${inputs.actionId}`, error);


      return exits.success();
    }

  },
};
