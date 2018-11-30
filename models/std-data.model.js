const OgmsSchemaStatics = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'STD_Data';
const schema = new mongoose.Schema({
    meta: mongoose.Schema.Types.Mixed,
    getter: String,
    models: mongoose.Schema.Types.Mixed,
    inputPath: String,
    outputPath: String,
    stdClass: String,
    content: mongoose.Schema.Types.Mixed
}, {collection: collectionName})
Object.assign(schema.statics, OgmsSchemaStatics)
module.exports = mongoose.model(collectionName, schema);