var mongoose = require('mongoose');

var wallSchema = new mongoose.Schema({
  name: String,
  postits: [],
  isCopy: Boolean,
  originalWallId: String,
  version: Number,
  date: Date
});

var postitSchema = new mongoose.Schema({
  name: String,
  content: String
});

wallSchema.methods.getName = function () {
  return this.name ? this.name : "Unnamed";
};

module.exports = {
  wall: wallSchema
};