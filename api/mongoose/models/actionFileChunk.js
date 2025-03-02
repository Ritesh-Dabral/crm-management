const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  'actionId':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'action',
    required:true
  },
  'fileId':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'file',
    required:true
  },
  'chunk':{
    type:[Object],
    required:true
  }
}, {timestamps:true, strict:false})
