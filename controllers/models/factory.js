let IBISCtrl = require('./IBIS')
let BIOME_BGCCtrl = require('./BIOME-BGC')

module.exports = function(calcuTask) {
    switch (calcuTask.ms.exeName) {
        case 'IBIS_2.6b4':
            return new IBISCtrl(calcuTask)
        case 'BIOME_BGC':
            return new BIOME_BGCCtrl(calcuTask)
    }
}