let os = require('os')
let fs = require('fs')
let path = require('path')

module.exports = {
    port: 1900,
    auth: false,
    jwt_secret: 'asdl;fjl;asdjflasjkfsl;jfdl;asdfjl;asdjkflsda',
    platform: (function() {
        let platform = 1;
        if (os.type() == 'Linux') {
            platform = 2;
        }
        return platform;
    })(),
    mongodb: {
        name: 'model_comparison_container',
        host: '172.31.96.1',
        port: '27017'
    },
    geo_data: {
        path: path.join(__dirname, '../resources/geo-data')
    },
    geo_models: {
        path: path.join(__dirname, '../resources/geo-models')
    },
    debug: {
        child_process: true
    },
    invoke_failed_tag: '-----this is an error identification-----',
    progressReg: /-----Progress:(.*)%-----/,
    STD_DATA: {
        IBIS_STD_DATA: {
            inputPath: 'E:\\Data\\IBIS_Data\\input',
            outputPath: 'E:\\Data\\IBIS_Data\\output'
        },
        BIOME_BGC_STD_DATA: {
            inputPath: 'E:\\Data\\Biome_BGC_Data',
            outputPath: 'E:\\Data\\Biome_BGC_Data\\outputs'
        }
    }
};