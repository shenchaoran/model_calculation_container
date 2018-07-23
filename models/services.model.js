let Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

let collectionName = 'Model_Service'
let schema = {
    auth: mongoose.Schema.Types.Mixed,
    MDL: mongoose.Schema.Types.Mixed,
    stdIds: mongoose.Schema.Types.Mixed,
    topic: String,
    exeName: String
}

module.exports = new Mongoose(collectionName, schema);