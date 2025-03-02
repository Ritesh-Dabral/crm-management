class ChunkEntityDao {
  constructor() {
  }

  async createChunkEntity({chunkEntities}, {session}){
    return await chunkEntity.create(chunkEntities, { session });
  }

  async getChunkEntityById({id}){
    return await chunkEntity.findOne({_id:id}).lean();
  }

  async getChunkEntities({query, sort, skip, limit}){
    const _chunkEntities = await chunkEntity.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
    return _chunkEntities;
  }

  async updateOneChunkEntity({query, update}){
    return await chunkEntity.updateOne(query, update);
  }
}

module.exports = ChunkEntityDao;
