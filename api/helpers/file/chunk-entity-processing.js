
const mongoose = require('mongoose');
const ChunkEntity = require('../../../services/chunkEntity.class');
const FileChunk = require('../../../services/fileChunk.class');

module.exports = {
  friendlyName: 'Chunk entity processing',

  description: 'Handles the chunk entity processing queue processing.',

  inputs: {
    chunkEntityId: {
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

    const _chunkEntity = new ChunkEntity();
    const chunkEntityResponse = (await _chunkEntity.getChunkEntities({query:{ _id: inputs.chunkEntityId, status: 'queued' }}))[0];
    if (!chunkEntityResponse) {
      sails.log.info('Chunk entity not found or status is not queued for chunkEntityId:' + inputs.chunkEntityId);
      return exits.success();
    }

    const _fileChunk = new FileChunk();

    const chunks = await _fileChunk.getFileChunkById({fileChunkId: chunkEntityResponse.fileChunkId});

    const { entity, action, identifier, matches } = chunkEntityResponse.processConfig;

    const session = await mongoose.startSession();

    let result = {};

    try {
      await session.startTransaction();
      switch (entity) {
        case 'contact':
          result = await contactProcessing({ action, identifier, matches, chunks: chunks.chunk},{session});
          break;
        default:
          sails.log.error('Invalid chunk entity type for chunkEntityId:' + inputs.chunkEntityId);
          break;
      }

      await _chunkEntity.updateOneChunkEntity({
        query:{ _id: inputs.chunkEntityId},
        update:{ $set:{status: 'done', result, error: null} }
      });
      await session.commitTransaction();
    } catch (error) {
      await _chunkEntity.updateOneChunkEntity({
        query:{ _id: inputs.chunkEntityId},
        update:{ $set:{status: 'ongoing', error: error.message}, $inc:{retry:1} }
      });
      await session.abortTransaction();
      throw error;
    } finally{
      await session.endSession();
    }

    return exits.success();

  },
};


async function contactProcessing({ action, identifier, matches, chunks }, {session}) {
  const bulkQueries = [];
  chunks.forEach( (chunk) => {
    const filter = {};
    const update = {};
    const internalToExternalProperty = {};

    matches.forEach( (match) => {
      const { internalProperty, csvField } = match;
      if(chunk.hasOwnProperty(csvField)) {
        update[internalProperty] = chunk[csvField];
      }
      internalToExternalProperty[internalProperty] = csvField;
    });

    const typeOfAction = action.includes('update') ? 'update' : 'create';

    identifier[typeOfAction].forEach( (internalProperty) => {
      const externalProperty = internalToExternalProperty[internalProperty];
      filter[internalProperty] = chunk[externalProperty];
    });

    const bulkQuery = {
      'updateOne': {
        'filter': filter,
        'update': { $set: update },
        'upsert': false
      }
    };

    switch (action) {
      case 'create':
        bulkQuery.updateOne.upsert = true;
        break;
      case 'create_and_update':
        bulkQuery.updateOne.upsert = true;
        break;
      default:
        bulkQuery.updateOne.upsert = false;
        break;
    }

    bulkQueries.push(bulkQuery);
  });



  const result = {
    isFailed: false,
    error: null,
    nMatched: 0,
    nModified: 0,
    nUpserted: 0
  };
  // if a single query fails, the entire transaction should be rolled back, this is the concept of atomicity and chunk processing in our case
  const resp = await contactEntity.bulkWrite(bulkQueries, { session  });
  result.nMatched = resp.nMatched;
  result.nModified = resp.nModified;
  result.nUpserted = resp.nUpserted;
  return result;
}
