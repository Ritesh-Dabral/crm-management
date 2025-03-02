const mongoose = require('mongoose');


const identifierSchema = new mongoose.Schema({
  create: {
    type: [String], // Assuming it’s an array of strings (change if needed)
    required: true
  },
  update: {
    type: [String], // Assuming it’s an array of strings (change if needed)
    required: true
  }
}, {_id: false});

const matchesSchema = new mongoose.Schema({
  csvField: {
    type: String,
    required: true
  },
  internalProperty: {
    type: String,
    required: true
  }
}, {_id: false});

const actionSchema = new mongoose.Schema({
  'entity':{
    type:String,
    required:true
  },
  'action':{
    type:String,
    required:true,
    enum:['create_and_update', 'create', 'update']
  },
  'identifier':{
    type:identifierSchema,
    required:true
  },
  'matches':{
    type:Array,
    required:true,
    items:matchesSchema
  }
}, {_id:false});

module.exports = new mongoose.Schema({
  'actionName':{
    type:String,
    required:true
  },
  'accountId':{
    type:String,
    required:true
  },
  'processTimeInMs':{
    type:Number,
    required:true,
  },
  'file':{
    type:mongoose.Schema.Types.ObjectId,
    ref:'file',
    required:true
  },
  'actions':{
    type:[actionSchema],
    required:true
  },
  'status':{
    type:String,
    required:true,
    enum:['queued','fileExtracted','ongoing','done','failed']
  }
}, {timestamps:true, strict:false});
