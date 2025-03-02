const Action = require('../../../services/action.class');
const FileChunk = require('../../../services/fileChunk.class');
const ChunkEntity = require('../../../services/chunkEntity.class');

module.exports = {


  friendlyName: 'Action summary',


  description: 'Get stats related to an action Id',


  inputs: {
    actionId:{
      required: true,
      type: 'string'
    }
  },


  exits: {
    success:{
      statusCode: 200
    }
  },


  fn: async function (inputs, exits) {

    const _action = new Action();
    const _fileChunk = new FileChunk();
    const _chunkEntity = new ChunkEntity();
    const stats = {
      'success': 0,
      'failure': 0,
      'skipped': 0,
      'remaining': 0,
      'total': 0
    };

    const chunkStatus = {
      'total':0,
      'done': 0,
      'queued': 0,
      'ongoing': 0,
      'failed': 0
    };
    let status = 'queued';


    const action = await _action.getActionById({actionId: inputs.actionId});
    if(!action){
      return exits.success(this.res.generalResponse({
        message: 'Action unavailable',
        data: {
          stats,
          status:null
        }
      }));
    }
    const fileChunks = await _fileChunk.getFileChunks({query:{fileId: action.file.toString()}});
    const fileChunkIds = fileChunks.map((_fc)=>{
      return _fc._id.toString();
    });
    const chunkEntities = await _chunkEntity.getChunkEntities({query:{fileChunkId:{$in:fileChunkIds}}});

    chunkEntities.forEach((chunkEntity)=>{
      stats.total+=chunkEntity.rows;
      switch(chunkEntity.status){
        case 'failed' : {
          stats.failure+=chunkEntity.rows;
          break;
        }
        case 'done': {
          const done = (_.get(chunkEntity, 'result.nUpserted', 0) + _.get(chunkEntity, 'result.nModified', 0));
          stats.success += done;
          stats.skipped = chunkEntity.rows - done;
          break;
        }
        default:
          stats.remaining += chunkEntity.rows;
          break;
      }

      chunkStatus[chunkEntity.status] = _.get(chunkStatus, `${chunkEntity.status}`, 0) + 1;
      chunkStatus.total+=1;
    });

    if(chunkStatus.done + chunkStatus.failed === chunkStatus.total){
      status = 'done';
    }else if(chunkStatus.ongoing){
      status = 'ongoing';
    }else{
      status = 'queued';
    }

    await _action.updateOneAction({
      query:{_id: inputs.actionId},
      update:{$set:{'status': status}}
    },{});

    return exits.success(this.res.generalResponse({
      message: 'Actions fetched successfully',
      data: {
        stats,
        status
      }
    }));
  }


};
