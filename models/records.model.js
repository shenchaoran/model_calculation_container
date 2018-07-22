let Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

let collectionName = 'Calcu_Task'
let schema = {
    meta: mongoose.Schema.Types.Mixed,
    auth: mongoose.Schema.Types.Mixed,
    ms: mongoose.Schema.Types.Mixed,
    topic: mongoose.Schema.Types.Mixed,
    cmpTaskId: String,
    node: mongoose.Schema.Types.Mixed,
    IO: mongoose.Schema.Types.Mixed,
    std: mongoose.Schema.Types.Mixed,
    state: String,
    progress: Number
}

module.exports = new Mongoose(collectionName, schema);