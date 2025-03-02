const FileChunkDao = require('../dao/fileChunk.dao');
const fcDao = new FileChunkDao();

class FileChunk{
  constructor(){}

  async createChunks({chunks}, {session=null}){
    return await fcDao.createChunks({chunks}, {session});
  }

  async updateOneChunk({query, set}, {session=null}){
    return await fcDao.updateOneChunk({query, set}, {session});
  }

  async getFileChunkById({fileChunkId}){
    return await fcDao.getFileChunkById({id: fileChunkId});
  }

  async getFileChunks({query, sort={}, skip=0, limit=0}){
    return await fcDao.getFileChunks({query, sort, skip, limit});
  }
}

module.exports = FileChunk;
