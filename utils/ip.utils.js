let os = require('os');

let IPCtrl = {};
module.exports = IPCtrl;

IPCtrl.getLocalIP = function () {
    let interfaces = os.networkInterfaces()
    let ipv4
    for(let key in interfaces) {
        // TODO virtuaBox host only network
        if(ipv4) 
            break
        for(let item of interfaces[key]) {
            if(!item.internal && item.family === 'IPv4') {
                global.ipv4 = item.address
                // console.log(item.address)
                ipv4 = item.address
                break
            }
        }
    }
    return ipv4
};