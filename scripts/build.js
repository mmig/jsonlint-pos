
var fs = require('fs-extra');
var path = require('path');

var buildJison = require('./build-jison');
var bundle = require('./bundle');

var rawFile = path.resolve(__dirname, '..', 'src/jsonlint.y');
var lexFile = path.resolve(__dirname, '..', 'src/jsonlint.l');

buildJison.build(rawFile, lexFile).then(function(parser){
    var libFile = path.resolve(__dirname, '..', 'lib/jsonlint-pos.js');
    var webFile = path.resolve(__dirname, '..', 'web/jsonlint-pos.js');

    bundle.bundleTo(parser, [libFile, webFile]).then(function(bundledCode){

        var minified = bundle.minifySync(bundledCode, 'jsonlint-pos.js');
        var minFile = path.resolve(__dirname, '..', 'web', 'jsonlint-pos.min.js');
        return Promise.all([
            fs.writeFile(minFile, minified.code, 'utf-8'),
            fs.writeFile(minFile + '.map', minified.map, 'utf-8')
        ]);
    });
});

function fail(err, origin){
    console.error('ERROR at ', origin, ': caused ', err);
    process.exit(1);
}

process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);
