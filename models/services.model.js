let Mongoose = require('./mongoose.base')

let collectionName = 'Models'
let schema = {
    name: String
}

module.exports = new Mongoose(collectionName, schema);