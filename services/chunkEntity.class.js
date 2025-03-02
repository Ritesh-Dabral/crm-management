const ChunkEntityDao = require('../dao/chunkEntity.dao');
const ceDao = new ChunkEntityDao();

class ChunkEntity{
  constructor(){}

  async createChunkEntity({chunkEntities}, {session=null}){
    return ceDao.createChunkEntity({chunkEntities},{session});
  }

}

module.exports = ChunkEntity;
