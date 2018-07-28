let Mongoose = require('./mongoose.base');
let mongoose = require('mongoose');

const schema = {
    host: String,
    port: String,
    prefix: String,
    auth: mongoose.Schema.Types.Mixed
};
let collectionName = 'Computing_Node';
let nodeDB = new Mongoose(collectionName, schema);

module.exports = nodeDB;