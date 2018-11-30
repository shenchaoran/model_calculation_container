const OgmsSchemaStatics = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Model_Service'
const schema = new mongoose.Schema({
    auth: mongoose.Schema.Types.Mixed,
    MDL: mongoose.Schema.Types.Mixed,
    nodeId: String,
    topic: String,
    exeName: String
}, {collection: collectionName})
Object.assign(schema.statics, OgmsSchemaStatics)

let modelModel = mongoose.model(collectionName, schema)
module.exports = modelModel;