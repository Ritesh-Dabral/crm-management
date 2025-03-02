const mongoose = require('mongoose');


module.exports = new mongoose.Schema({
  'chunkId':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'actionFileChunk',
    required:true
  },
  'processConfig':{
    type: Object,
    required:true
  },
  'status':{
    type:String,
    required:true,
    enum:['queued','ongoing','done','failed']
  }
}, {timestamps:true, strict:false})
