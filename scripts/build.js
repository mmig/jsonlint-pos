
var fs = require('fs-extra');
var path = require('path');

var buildJison = require('./build-jison');
var bundle = require('./bundle');

var rawFile = path.resolve(__dirname, '..', 'src/jsonlint.y');
var lexFile = path.resolve(__dirname, '..', 'src/jsonlint.l');

buildJison.build(rawFile, lexFile).then(function(parser){
    var libFile = path.resolve(__dirname, '..', 'lib/jsonlint-ext.js');
    var webFile = path.resolve(__dirname, '..', 'web/jsonlint-ext.js');

    bundle.bundleTo(parser, [libFile, webFile]).then(function(bundledCode){

        var minFileName = 'jsonlint-ext.min.js'
        var minFile = path.resolve(__dirname, '..', 'web', minFileName);
        var minified = bundle.minifySync(bundledCode, minFileName);

        return Promise.all([
            fs.writeFile(minFile, minified.code, 'utf-8'),
            fs.writeFile(minFile + '.map', minified.map, 'utf-8')
        ])
    });
})
