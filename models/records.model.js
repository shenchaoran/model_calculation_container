const OgmsSchemaStatics = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Calcu_Task';
const schema = new mongoose.Schema({
    meta: mongoose.Schema.Types.Mixed,
    auth: mongoose.Schema.Types.Mixed,
    cmpTaskId: String,
    cmpTaskName: String,
    IO: mongoose.Schema.Types.Mixed,
    nodeId: String,
    msId: String,
    msName: String,
    topicId: String,
    topicName: String,
    log: mongoose.Schema.Types.Mixed,
    state: String,
    progress: Number,
    cid: String,
    subscribed_uids: Array,
}, {collection: collectionName})
Object.assign(schema.statics, OgmsSchemaStatics)
module.exports = mongoose.model(collectionName, schema);