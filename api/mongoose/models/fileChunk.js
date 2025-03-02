const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  'fileId':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'file',
    required:true
  },
  'actionId':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'action',
    required:true
  },
  'chunk':{
    type:[Object],
    required:true
  }
}, {timestamps:true, strict:false});
