let Mongoose = require('./mongoose.base');
let mongoose = require('mongoose');

let schema = {
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
let collectionName = 'Geo_Data';
let geoDataDB = new Mongoose(collectionName, schema);

module.exports = geoDataDB;