const ChunkEntityDao = require('../dao/chunkEntity.dao');
const ceDao = new ChunkEntityDao();

class ChunkEntity{
  constructor(){}

  async createChunkEntity({chunkEntities}, {session=null}){
    return ceDao.createChunkEntity({chunkEntities},{session});
  }

  async getChunkEntities({query, sort={}, skip=0, limit=0}){
    return ceDao.getChunkEntities({query, sort, skip, limit});
  }

  async updateOneChunkEntity({query, update}){
    return ceDao.updateOneChunkEntity({query, update});
  }

}

module.exports = ChunkEntity;
