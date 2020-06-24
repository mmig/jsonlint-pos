var fs = require('fs');
var path = require('path');

var template = require('./template');

function bundle(srcPath){

    var srcFile = fs.existsSync(srcPath)? fs.readFileSync(srcPath, 'utf8') : srcPath;

    var source = template.preamble + template.umdHeader +
        srcFile +
        template.moduleExports + template.umdFooter;

    return source;
}

function bundleTo(srcPath, targets){
    var source = bundle(srcPath);
    var t;
    for(var i=0,size=targets.length; i < size; ++i){
        t = targets[i];
        fs.writeFileSync(path.resolve(__dirname, '..', t), source);
    }
}

module.exports = {
    bundle: bundle,
    bundleTo: bundleTo
}

if (require.main === module) {

    if(process.argv.length === 2){

        var srcPath = path.resolve(__dirname, '..', 'jsonlint.js');
        console.log(bundle(srcPath));

    } else {

        var srcPath = path.resolve(__dirname, '..', process.argv[2]);
        var targets = process.argv.slice(3);
        bundleTo(srcPath, targets);
    }
}
