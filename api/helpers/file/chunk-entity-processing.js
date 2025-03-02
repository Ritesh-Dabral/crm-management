
const mongoose = require('mongoose');


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

    const chunkEntityResponse = await chunkEntityMapping.findOne({ _id: inputs.chunkEntityId, status: 'queued' }).lean();
    if (!chunkEntityResponse) {
      sails.log.info('Chunk entity not found or status is not queued for chunkEntityId:' + inputs.chunkEntityId);
      return exits.success();
    }

    const chunks = await actionFileChunk.findOne({ _id: chunkEntityResponse.chunkId }).lean();

    const { entity, action, identifier, matches } = chunkEntityResponse.processConfig;

    try {

      switch (entity) {
        case 'contact':
          await contactProcessing({ action, identifier, matches, chunks: chunks.chunk});
          break;
        default:
          sails.log.error('Invalid chunk entity type for chunkEntityId:' + inputs.chunkEntityId);
          break;
      }




      return exits.success();

    } catch (error) {
      sails.log.error(`Error in chunk generation for actionId: ${inputs.actionId}`, error);

      await chunkEntityMapping.updateOne(
        { id: inputs.chunkEntityId },
        { status: 'failed', error: error.message }
      );

      return exits.success();
    }

  },
};


async function contactProcessing({ action, identifier, matches, chunks }) {
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

  const session = await mongoose.startSession();
  session.startTransaction();

  const result = {
    isFailed: false,
    error: null,
    nMatched: 0,
    nModified: 0,
    nUpserted: 0
  };
  try {
    // if a single query fails, the entire transaction should be rolled back, this is the concept of atomicity and chunk processing in our case
    const resp = await contactEntity.bulkWrite(bulkQueries, { session  });
    await session.commitTransaction();
    result.nMatched = resp.nMatched;
    result.nModified = resp.nModified;
    result.nUpserted = resp.nUpserted;
    console.log('Bulk write successful with transaction');
  } catch (error) {
    await session.abortTransaction(); // Rollback all changes
    console.error('Transaction aborted due to error:', error);
    result.isFailed = true;
    result.error = error.message;
  } finally {
    session.endSession();
  }

  return result;
}
