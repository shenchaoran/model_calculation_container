let Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

let collectionName = 'Model_Service'
let schema = {
    auth: mongoose.Schema.Types.Mixed,
    MDL: mongoose.Schema.Types.Mixed,
    stdId: String,
    stdClass: String,
    topic: String,
    path: String,
    exeName: String
}

module.exports = new Mongoose(collectionName, schema);