
var fs = require('fs-extra');
var path = require('path');
var uglify = require('uglify-js');

var template = require('./template');

function bundle(srcPath){

    var promise = fs.existsSync(srcPath)? fs.readFile(srcPath, 'utf8') : Promise.resolve(srcPath);

    return promise.then(function(srcFile){
        var source = template.preamble + template.umdHeader +
            srcFile +
            template.moduleExports + template.umdFooter;

        return source;
    });
}

function bundleTo(srcPath, targets){
    return bundle(srcPath).then(function(source){
        var t, files = [];
        if(!Array.isArray(targets)){
            targets = [targets];
        }
        for(var i=0,size=targets.length; i < size; ++i){
            t = targets[i];
            files.push(fs.writeFile(path.resolve(__dirname, '..', t), source));
        }
        return Promise.all(files).then(function(){
            return source;
        });
    });
}

function minifySync(code, targetFileName){
    return uglify.minify(code, {
        sourceMap: {
            filename: targetFileName,
            url: targetFileName + '.map'
        }
    });
}

module.exports = {
    bundle: bundle,
    bundleTo: bundleTo,
    minifySync: minifySync
}

if (require.main === module) {

    if(process.argv.length === 2){

        var srcPath = path.resolve(__dirname, '..', 'jsonlint.js');
        bundle(srcPath).then(function(src){
            console.log(src);
        });

    } else {

        var srcPath = path.resolve(__dirname, '..', process.argv[2]);
        var targets = process.argv.slice(3);
        bundleTo(srcPath, targets);
    }
}
