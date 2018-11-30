const OgmsSchemaStatics = require('./mongoose.base')
const mongoose = require('mongoose');

const collectionName = 'Geo_Data';
const schema = new mongoose.Schema({
    meta: {
        desc: String,
        path: String,
        name: String
    },
    auth: {
        src: String,
        userId: String
    },
    udxcfg: mongoose.Schema.Types.Mixed // maybe no use
}, {collection: collectionName})
Object.assign(schema.statics, OgmsSchemaStatics)
module.exports = mongoose.model(collectionName, schema);