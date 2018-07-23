let os = require('os')
let fs = require('fs')
let path = require('path')

module.exports = {
    port: 6868,
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
        host: '192.168.79.1',
        port: '27017'
    },
    geo_data: {
        path: path.join(__dirname, '../resources/geo-data'),
        max_size: 500000000
    },
    geo_models: {
        path: path.join(__dirname, '../resources/geo-models'),
        max_size: 500000000
    },
    debug: {
        child_process: true
    },
    invoke_failed_tag: '-----this is an error identification-----',
    progressReg: /-----Progress:(.*)%-----/,
    // 由 STD 转换重构过来的数据路径
    STD_DATA: {
        'IBIS_2.6b4': '~/STD_DATA/IBIS_2.6b4',
        BIOME_BGC_STD_DATA: {
            inputPath: 'E:/Data/Biome_BGC_Data',
            outputPath: 'E:/Data/Biome_BGC_Data/outputs'
        }
    }
};