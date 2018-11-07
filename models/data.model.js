const Mongoose = require('./mongoose.base');
const mongoose = require('mongoose');

const schema = {
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
};
const collectionName = 'Geo_Data';
const geoDataDB = new Mongoose(collectionName, schema);

module.exports = geoDataDB;