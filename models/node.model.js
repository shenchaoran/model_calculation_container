const Mongoose = require('./mongoose.base');
const mongoose = require('mongoose');

const schema = {
    host: String,
    port: String,
    prefix: String,
    auth: mongoose.Schema.Types.Mixed
};
const collectionName = 'Computing_Node';
const nodeDB = new Mongoose(collectionName, schema);

module.exports = nodeDB;