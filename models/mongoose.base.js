let Promise = require('bluebird');
const mongoose = require('mongoose');
let _ = require('lodash')
let ObjectID = require('mongodb').ObjectID
let setting = require('../config/setting')

mongoose.Promise = require('bluebird');
const url =
    'mongodb://' +
    setting.mongodb.host +
    ':' +
    setting.mongodb.port +
    '/' +
    setting.mongodb.name;
    
mongoose.connect(url);

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose err\n' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

module.exports = function(collectionName, schema) {
    this.schema = new mongoose.Schema(schema, {
        collection: collectionName
    });
    this.model = mongoose.model(collectionName, this.schema);

    this.findOne = (where) => {
        return new Promise((resolve, reject) => {
            this.model.find(where, (err, docs) => {
                if (err) {
                    return reject(err);
                } else {
                    if(docs.length) {
                        return resolve(docs[0]._doc);
                    }
                    else {
                        return reject(new Error('No data found!'));
                    }
                }
            });
        });
    }

    this.find = (where) => {
        return new Promise((resolve, reject) => {
            this.model.find(where, (err, docs) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(_.map(docs, doc => {
                        return doc.toJSON();
                    }));
                }
            });
        });
    }

    /**
     * 分页查询
     * return 
     *      {
     *          count: number,
     *          docs[]
     *      }
     */
    this.findByPage = (where, pageOpt) => {
        return Promise.all([
            new Promise((resolve, reject) => {
                this.model
                    .find()
                    .count((err, count) => {
                        if (err) {
                            return reject(err)
                        } else {
                            return resolve(count);
                        }
                    });
            }),
            new Promise((resolve, reject) => {
                this.model
                    .find(where, (err, docs) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(_.map(docs, doc => {
                                return doc.toJSON();
                            }));
                        }
                    })
                    .limit(pageOpt.pageSize)
                    .skip(pageOpt.pageSize* (pageOpt.pageNum- 1));
            })
        ])
            .then(rsts => {
                return Promise.resolve({
                    count: rsts[0],
                    docs: rsts[1]
                });
            })
            .catch(Promise.reject);
    }

    this.remove = (where) => {
        return new Promise((resolve, reject) => {
            this.model.remove(where, (err, doc) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(doc);
                }
            });
        });
    }

    this.insert = (item) => {
        const model = new this.model(item);
        return new Promise((resolve, reject) => {
            model.save((err, rst) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(rst._doc);
                }
            });
        });
    }

    this.insertBatch = (docs, options) => {
        return new Promise((resolve, reject) => {
            this.model.collection.insert(docs, options, (err, rst) => {
                if(err) {
                    return reject(err);
                }
                else {
                    return resolve(rst);
                }
            });
        });
    }

    this.update = (where, update, options) => {
        return new Promise((resolve, reject) => {
            this.model.update(where, update, options, (err, rst) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(rst);
                }
            });
        });
    }

    this.upsert = (where, update, options) => {
        return new Promise((resolve, reject) => {
            if(options === undefined) {
                options = {};
            }
            options.upsert = true;
            this.model.update(where, update, options, (err, rst) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(rst);
                }
            });
        });
    }
}