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
}

module.exports = FileChunk;
