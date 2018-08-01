let IBIS_26b4 = require('./IBIS_2.6b4')
let BIOME_BGC_site = require('./BIOME-BGC_site')
let IBIS_site = require('./IBIS_site')

module.exports = function(calcuTask) {
    switch (calcuTask.ms.MDL.meta.name) {
        case 'IBIS_2.6b4':
            return new IBIS_26b4(calcuTask)
        case 'IBIS site':
            return new IBIS_site(calcuTask)
        case 'BIOME-BGC site':
            return new BIOME_BGC_site(calcuTask)
    }
}