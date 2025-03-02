
const mongoose = require('mongoose');
const File = require('../../../services/file.class');
const Action = require('../../../services/action.class');
const FileChunk = require('../../../services/fileChunk.class');
const ChunkEntity = require('../../../services/chunkEntity.class');
const BullQueueWorker = require('../../../services/bullQueue.class');
const WorkerInterface = require('../../../interfaces/worker.interface');


module.exports = {
  friendlyName: 'Chunk generation',

  description: 'Handles the chunk generation queue processing.',

  inputs: {
    actionId: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Queue processed successfully.',
    },
    error: {
      description: 'An error occurred during queue processing.',
    },
  },

  fn: async function (inputs, exits) {

    const _action = new Action();
    // const actionResponse = await action.findOne({ _id: inputs.actionId, status: 'queued' }).lean();
    const actionResponse = (await _action.getActions({query:{_id: inputs.actionId, status: 'queued'}}))[0];

    if (!actionResponse) {
      sails.log.info('Action not found or status is not queued for actionId:' + inputs.actionId);
      return exits.success();
    }

    const file = new File();
    const fileResponse = await file.getFileById({fileId:actionResponse.file._id});

    const _fileChunk = new FileChunk();
    const _chunkEntity = new ChunkEntity();

    let worker = new BullQueueWorker();
    worker.init('chunk-entity');

    if(!worker instanceof WorkerInterface) {
      throw new Error('Invalid WorkerInterface type of instance');
    }

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
        fileId: fileResponse._id.toString(),
        actionId: actionResponse._id.toString(),
        chunk: chunk
      };
    });

    const session = await mongoose.startSession();
    await session.startTransaction();

    try {

      const chunkEntityMappings = [];
      const fileChunksResponse = await _fileChunk.createChunks({chunks: fileChunks}, {session});

      fileChunksResponse.forEach( (fileChunk) => {
        actionResponse.actions.forEach( (processing) => {
          chunkEntityMappings.push({
            chunkId: fileChunk._id.toString(),
            processConfig: processing,
            status: 'queued'
          });
        });
      });

      const chunkEntityMappingResponse = await _chunkEntity.createChunkEntity({chunkEntities: chunkEntityMappings}, {session});

      const jobs = chunkEntityMappingResponse.map( (chunkEntityMapping) => {
        return chunkEntityMapping._id.toString();
      });

      await worker.chunkEntityBulkQueueProducer({chunkEntity:jobs});

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return exits.success();

  },
};
