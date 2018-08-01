let os = require('os')
let setting = require('../config/setting')
let IPCtrl = require('../utils/ip.utils')
let nodeDB = require('../models/node.model')

module.exports = () => {
    global.ipv4 = IPCtrl.getLocalIP()
    console.log('******** local IP: ' + global.ipv4)
    return nodeDB.update({ 'auth.nodeName': setting.nodeName }, {
        $set: {
            host: global.ipv4,
            port: setting.port,
            API_prefix: setting.API_prefix
        }
    })
        .then(msg => {
            console.log('******** update computing server\'s local ip succeed!')
        })
}