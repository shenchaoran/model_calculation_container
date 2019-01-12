let http = require('http');
let fs = require('fs');
let path = require('path');

//三种方法来保存网络资源文件
let url = 'http://geomodeling.njnu.edu.cn/assets/imgs/help/aboutUs/Team2.jpg';
let dataUrl = 'http://localhost:9990/integration/data/5adf5e23a21f3cd2f0a568cb';
http.get(dataUrl, function(res) {
    //直接使用Buffer的concat来进行连接，合并Buffer之后一次性写入
    var buffer = new Buffer(0);
    //使用字符串来进行读写，这里特别要注意的事情就是编码，特别需要注意的是
    //如果数据是二进制流的话，请一定使用ascii来统一Buffer和String之间的转换
    var buffer2 ='';
    //使用文件句柄来分段写入Buffer，操作时间长，如果文件不大的话
    //最佳的方案是把缓存收集在一起（第一种或第二种），然后进行异步写入到文件
    var fd = fs.openSync(path.join(__dirname, '1.zip'), 'w');

    //如果资源是二进制的，直接使用字符串来收集所有的chunk，然后
    //将chunk写入到文件中是会错误的，因为chunk是Buffer类型，默认转换为String
    //是utf8的编码，因为是二进制数据，所有有的数据可能不一定能转换成功
    //如果将数据解释失败，则会导致内存缓存块大小不一样而导致文件保存错误.
    //二进制的话，始终用ascii来作为中间编码格式来进行转换，因为ascii是8位的
    //Buffer也是Int8Array，所以按照单个字节是肯定不会出错的。
    //使用方法首先收集Buffer
    //str_buffer += chunk.toString('ascii');
    //fs.writeFileSync(filename, Buffer.from(str_buffer,'ascii'));
    //或者异步写入fs.writeFile(filename, Buffer.from(str_buffer,'asciii'), function(err){});
    //****************************************************************************
    //如果下载资源是文本，有特定的编码格式，则可以直接使用正确的编码来进行解释处理

    res.on('data', function(chunk){
        buffer2 += chunk.toString('ascii');
        fs.writeSync(fd, chunk, 0, chunk.length);
        buffer = Buffer.concat([buffer,chunk]);
    });

    res.on('end', function(){
        console.log('Data receive complete.');
        fs.closeSync(fd);
        var buf2 = Buffer.from(buffer2,'ascii');
        console.log(Buffer.compare(buffer, buf2));
        console.log('buffer_size ' + buffer.length);
        console.log('buf2_size ' + buf2.length);

        fs.writeFileSync(path.join(__dirname, '1-1.zip'), buffer);
        fs.writeFileSync(path.join(__dirname, '1-2.zip'), buf2);
   });
});