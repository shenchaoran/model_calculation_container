const Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Model_Service'
const schema = {
    auth: mongoose.Schema.Types.Mixed,
    MDL: mongoose.Schema.Types.Mixed,
    stdIds: mongoose.Schema.Types.Mixed,
    nodeId: String,
    topic: String,
    exeName: String
}

module.exports = new Mongoose(collectionName, schema);