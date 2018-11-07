const Mongoose = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Calcu_Task'
const schema = {
    meta: mongoose.Schema.Types.Mixed,
    auth: mongoose.Schema.Types.Mixed,
    cmpTaskId: String,
    IO: mongoose.Schema.Types.Mixed,
    ms: mongoose.Schema.Types.Mixed,    // 可能出现更新的问题
    std: mongoose.Schema.Types.Mixed,   // 可能出现更新的问题
    state: String,
    progress: Number
}

module.exports = new Mongoose(collectionName, schema);