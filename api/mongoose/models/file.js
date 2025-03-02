const mongoose = require('mongoose');


module.exports = new mongoose.Schema({
  'name':{
    type: Object,
    required:true
  },
  'type':{
    type:String,
    required:true,
    enum:['csv','xlsx','xls']
  },
  'url':{
    type:String,
    required:true
  },
  'rows':{
    type:Number,
    required:true,
    min:0
  },
  'columns':{
    type:Number,
    required:true,
    min:0
  }
}, {timestamps:true});
