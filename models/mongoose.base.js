let Bluebird = require('bluebird');
const mongoose = require('mongoose');
let _ = require('lodash')
let ObjectID = require('mongodb').ObjectID
let setting = require('../config/setting')

mongoose.Promise = Bluebird
const url = 'mongodb://' + setting.mongodb.host + ':' + setting.mongodb.port + '/' + setting.mongodb.name;
    
mongoose.connect(url);

mongoose.connection.on('connected', () => {
    console.log(`******** Mongoose connected: ${url}`);
});

mongoose.connection.on('error', (err) => {
    console.log('******** Mongoose err:\n' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('******** Mongoose disconnected');
});

module.exports = {
    findByIds: async function (ids) {
        try {
            return Bluebird.map(ids, id => this.findById(id));
        }
        catch (e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    },

    /**
     * ????
     * @return
     *      {
     *          count: number,
     *          docs: any[]
     *      }
     */
    findByPages: async function (where, pageOpt) {
        try {
            let [count, docs] = await Bluebird.all([
                this.countDocuments(),
                this
                    .find(where)
                    .sort({ _id: -1 })
                    .limit(pageOpt.pageSize)
                    .skip(pageOpt.pageSize * (pageOpt.pageIndex - 1))
            ])
            return { count, docs };
        }
        catch (e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    },
    
    /**
     * ????????? ????????????
     * @return
     *      {
     *          count: number,
     *          docs: any[]
     *      }
     */
    findByUserId: async function (userId) {
        try {
            let docs = await this.find().or([
                {
                    "auth.userId": userId
                },
                {
                    subscribed_uids: {
                        $in: [userId]
                    }
                }
            ]).sort({ _id: -1 })
            return { docs }
        }
        catch (e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    },

    upsert: async function (where, update, options) {
        try {
            !!options || (options = {})
            options.upsert = true;
            return this.updateOne(where, update, options)
        }
        catch (e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    },

    insert: async function (item) {
        try {
            let queryId
            if (item._id) {
                queryId = item._id;
            }
            else {
                queryId = new ObjectID();
                item._id = queryId;
            }
            return this.updateOne({ _id: queryId }, item, { upsert: true })
                .then(rst => {
                    return item
                })
        }
        catch (e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    },
}