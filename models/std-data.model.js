const Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'STD_Data'
const schema = {
    meta: mongoose.Schema.Types.Mixed,
    getter: String,
    models: mongoose.Schema.Types.Mixed,
    inputPath: String,
    outputPath: String,
    stdClass: String,
    content: mongoose.Schema.Types.Mixed
}

module.exports = new Mongoose(collectionName, schema);