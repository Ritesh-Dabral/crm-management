const mongoose = require('mongoose');


module.exports = new mongoose.Schema({
  'fileChunkId':{
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
  },
  'rows':{
    type: Number,
    required: true,
    min: 0
  }
}, {timestamps:true, strict:false});
