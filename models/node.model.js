const OgmsSchemaStatics = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Computing_Node';
const schema = new mongoose.Schema({
    host: String,
    port: String,
    prefix: String,
    auth: mongoose.Schema.Types.Mixed
}, {collection: collectionName})
Object.assign(schema.statics, OgmsSchemaStatics)
module.exports = mongoose.model(collectionName, schema);