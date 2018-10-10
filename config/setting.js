let os = require('os')
let fs = require('fs')
let path = require('path')

module.exports = {
    nodeName: "scr-windows",
    port: 6868,
    auth: false,
    jwt_secret: 'asdl;fjl;asdjflasjkfsl;jfdl;asdfjl;asdjkflsda',
    API_prefix: '',
    fiddler_proxy: {
        host: 'localhost',
        port: 3122,
        use: true
    },
    platform: (function () {
        let platform = 1;
        if (os.type() == 'Linux') {
            platform = 2;
        }
        return platform;
    })(),
    portal: {
        host: '223.2.44.234',
        port: '9999'
    },
    mongodb: {
        name: 'Comparison',
        host: '223.2.44.234',
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
    // 这里的 key 是 ms 数据库中的 model name，模型根据这里的配置找到标准数据集的路径
    // 换部署服务器时，这里也要更新成对应的文件路径
    STD_DATA: {
        'IBIS_2.6b4': '/home/shencr/STD_DATA/IBIS_2.6b4',
        'IBIS site': 'E:/Data/IBIS_Data',
        'BIOME-BGC site': 'E:/Data/Biome_BGC_Data'
    }
};