const mongoose = require('mongoose');


module.exports = new mongoose.Schema({
  'email':{
    type:String,
    required:true
  },
  'name':{
    type:String,
    required:false
  },
  'contact':{
    type:String,
    required:false
  },
  'status':{
    type:String,
    required:false
  },
  'age':{
    type:Number,
    required:false
  },
  'gender':{
    type:String,
    required:false
  },
  'company':{
    type:String,
    required:false
  },
  'title':{
    type:String,
    required:false
  }
}, {timestamps:true, strict:false})
