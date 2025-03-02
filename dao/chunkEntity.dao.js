class ChunkEntityDao {
  constructor() {
  }

  async createChunkEntity({chunkEntities}, {session}){
    return await chunkEntity.create(chunkEntities, { session });
  }
}

module.exports = ChunkEntityDao;
